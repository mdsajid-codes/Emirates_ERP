package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.*;
import com.example.multi_tanent.crm.entity.CrmRole;
import com.example.multi_tanent.crm.entity.CrmRoleModulePermission;
import com.example.multi_tanent.crm.entity.CrmUserRoleAssignment;
import com.example.multi_tanent.crm.repository.CrmRoleModulePermissionRepository;
import com.example.multi_tanent.crm.repository.CrmRoleRepository;
import com.example.multi_tanent.crm.repository.CrmUserRoleAssignmentRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmRoleService {

    private final CrmRoleRepository roleRepo;
    private final CrmRoleModulePermissionRepository modulePermRepo;
    private final CrmUserRoleAssignmentRepository assignmentRepo;
    private final TenantRepository tenantRepo;
    private final CrmAuditService auditService;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(readOnly = true)
    public List<CrmRoleResponse> getAll() {
        Tenant t = currentTenant();
        List<CrmRole> roles = roleRepo.findByTenantIdOrderByNameAsc(t.getId());
        return roles.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CrmRoleResponse getById(Long id) {
        Tenant t = currentTenant();
        CrmRole role = roleRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("CrmRole not found: " + id));
        return toResponse(role);
    }

    public CrmRoleResponse create(CrmRoleRequest req) {
        Tenant t = currentTenant();

        if (roleRepo.existsByTenantIdAndNameIgnoreCase(t.getId(), req.getName().trim())) {
            throw new IllegalArgumentException("CrmRole name already exists");
        }

        CrmRole clonedFrom = null;
        if (req.getCloneRoleId() != null) {
            clonedFrom = roleRepo.findByIdAndTenantId(req.getCloneRoleId(), t.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Clone role not found: " + req.getCloneRoleId()));
        }

        CrmRole role = CrmRole.builder()
                .tenant(t)
                .name(req.getName().trim())
                .description(req.getDescription())
                .clonedFrom(clonedFrom)
                .build();
        CrmRole savedRole = roleRepo.save(role);
        final CrmRole fRole = savedRole;

        // If clone selected, copy all permissions from source
        if (clonedFrom != null) {
            List<CrmRoleModulePermission> srcPerms = modulePermRepo.findByRole_Id(clonedFrom.getId());
            List<CrmRoleModulePermission> toSave = srcPerms.stream()
                    .map(sp -> copyPermission(fRole, sp))
                    .collect(Collectors.toList());
            modulePermRepo.saveAll(toSave);
        }

        // Apply explicit permissions if provided
        if (req.getPermissions() != null && !req.getPermissions().isEmpty()) {
            saveModulePermissions(fRole, req.getPermissions());
        }

        auditService.log("ROLE_CREATED", "ROLE", fRole.getId(),
                "Role '" + fRole.getName() + "' created");

        return toResponse(fRole);
    }

    public CrmRoleResponse update(Long id, CrmRoleRequest req) {
        Tenant t = currentTenant();
        CrmRole role = roleRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("CrmRole not found: " + id));

        String newName = req.getName() != null ? req.getName().trim() : role.getName();
        if (!role.getName().equalsIgnoreCase(newName)
                && roleRepo.existsByTenantIdAndNameIgnoreCase(t.getId(), newName)) {
            throw new IllegalArgumentException("CrmRole name already exists");
        }

        role.setName(newName);
        role.setDescription(req.getDescription());
        roleRepo.save(role);

        if (req.getPermissions() != null) {
            saveModulePermissions(role, req.getPermissions());
        }

        auditService.log("ROLE_UPDATED", "ROLE", role.getId(),
                "Role '" + role.getName() + "' updated");

        return toResponse(role);
    }

    public void delete(Long id) {
        Tenant t = currentTenant();
        CrmRole role = roleRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("CrmRole not found: " + id));
        
        modulePermRepo.deleteByRole_Id(role.getId());
        roleRepo.delete(role);

        auditService.log("ROLE_DELETED", "ROLE", id,
                "Role '" + role.getName() + "' was deleted");
    }

    public void assignUser(Long roleId, Long employeeId) {
        Tenant t = currentTenant();
        CrmRole role = roleRepo.findByIdAndTenantId(roleId, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Role not found"));

        assignmentRepo.deleteByTenant_IdAndEmployeeId(t.getId(), employeeId);

        CrmUserRoleAssignment assignment = CrmUserRoleAssignment.builder()
                .tenant(t)
                .employeeId(employeeId)
                .role(role)
                .build();
        assignmentRepo.save(assignment);

        auditService.log("ROLE_ASSIGNED", "ROLE", role.getId(),
                "Role '" + role.getName() + "' assigned to employee ID: " + employeeId);
    }

    public void removeUserAssignment(Long employeeId) {
        Tenant t = currentTenant();
        assignmentRepo.deleteByTenant_IdAndEmployeeId(t.getId(), employeeId);

        auditService.log("ROLE_UNASSIGNED", "ROLE", null,
                "Role unassigned from employee ID: " + employeeId);
    }

    @Transactional(readOnly = true)
    public CrmMyPermissionsResponse getMyPermissions(Long employeeId) {
        Tenant t = currentTenant();
        Optional<CrmUserRoleAssignment> assignment = assignmentRepo.findByTenant_IdAndEmployeeId(t.getId(), employeeId);
        
        Map<String, CrmModulePermissionDto> permMap = new HashMap<>();
        
        if (assignment.isPresent()) {
            List<CrmRoleModulePermission> perms = modulePermRepo.findByRole_Id(assignment.get().getRole().getId());
            for (CrmRoleModulePermission p : perms) {
                permMap.put(p.getModule(), toDto(p));
            }
        }
        
        return CrmMyPermissionsResponse.builder().permissions(permMap).build();
    }

    /* ---------- helpers ---------- */

    private void saveModulePermissions(CrmRole role, List<CrmModulePermissionDto> dtos) {
        modulePermRepo.deleteByRole_Id(role.getId());
        modulePermRepo.flush(); // Flush deletions before inserting new records to avoid unique constraint issues
        List<CrmRoleModulePermission> entities = dtos.stream()
                .map(dto -> toEntity(role, dto))
                .collect(Collectors.toList());
        modulePermRepo.saveAll(entities);
    }

    private CrmRoleModulePermission copyPermission(CrmRole targetRole, CrmRoleModulePermission src) {
        return CrmRoleModulePermission.builder()
                .role(targetRole)
                .module(src.getModule())
                .canView(src.getCanView())
                .canCreate(src.getCanCreate())
                .canUpdate(src.getCanUpdate())
                .canDelete(src.getCanDelete())
                .canExport(src.getCanExport())
                .canImport(src.getCanImport())
                .canChangeOwner(src.getCanChangeOwner())
                .canSendEmail(src.getCanSendEmail())
                .ownerOnly(src.getOwnerOnly())
                .build();
    }

    private CrmRoleModulePermission toEntity(CrmRole role, CrmModulePermissionDto dto) {
        return CrmRoleModulePermission.builder()
                .role(role)
                .module(dto.getModule())
                .canView(dto.getCanView())
                .canCreate(dto.getCanCreate())
                .canUpdate(dto.getCanUpdate())
                .canDelete(dto.getCanDelete())
                .canExport(dto.getCanExport())
                .canImport(dto.getCanImport())
                .canChangeOwner(dto.getCanChangeOwner())
                .canSendEmail(dto.getCanSendEmail())
                .ownerOnly(dto.getOwnerOnly() != null ? dto.getOwnerOnly() : false)
                .build();
    }

    private CrmModulePermissionDto toDto(CrmRoleModulePermission p) {
        return CrmModulePermissionDto.builder()
                .module(p.getModule())
                .canView(p.getCanView())
                .canCreate(p.getCanCreate())
                .canUpdate(p.getCanUpdate())
                .canDelete(p.getCanDelete())
                .canExport(p.getCanExport())
                .canImport(p.getCanImport())
                .canChangeOwner(p.getCanChangeOwner())
                .canSendEmail(p.getCanSendEmail())
                .ownerOnly(p.getOwnerOnly())
                .build();
    }

    private CrmRoleResponse toResponse(CrmRole role) {
        List<CrmRoleModulePermission> links = modulePermRepo.findByRole_Id(role.getId());
        List<CrmModulePermissionDto> perms = links.stream().map(this::toDto).collect(Collectors.toList());
        int userCount = assignmentRepo.findByRole_Id(role.getId()).size();

        return CrmRoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .tenantId(role.getTenant().getId())
                .clonedFromId(role.getClonedFrom() != null ? role.getClonedFrom().getId() : null)
                .permissions(perms)
                .userCount(userCount)
                .build();
    }
}
