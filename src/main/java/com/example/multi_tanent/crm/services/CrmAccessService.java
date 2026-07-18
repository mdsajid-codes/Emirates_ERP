package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.entity.CrmRoleModulePermission;
import com.example.multi_tanent.crm.entity.CrmUserRoleAssignment;
import com.example.multi_tanent.crm.repository.CrmRoleModulePermissionRepository;
import com.example.multi_tanent.crm.repository.CrmUserRoleAssignmentRepository;
import com.example.multi_tanent.master.enums.Role;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.Optional;

@Component("crmAccess")
@RequiredArgsConstructor
public class CrmAccessService {
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;
    private final CrmUserRoleAssignmentRepository assignmentRepository;
    private final CrmRoleModulePermissionRepository modulePermissionRepository;

    public boolean canView(String module) {
        return check(module, "view");
    }

    public boolean canCreate(String module) {
        return check(module, "create");
    }

    public boolean canUpdate(String module) {
        return check(module, "update");
    }

    public boolean canDelete(String module) {
        return check(module, "delete");
    }

    public boolean canExport(String module) {
        return check(module, "export");
    }

    public boolean canImport(String module) {
        return check(module, "import");
    }

    public boolean canChangeOwner(String module) {
        return check(module, "changeOwner");
    }

    public boolean canSendEmail(String module) {
        return check(module, "sendEmail");
    }

    private boolean check(String module, String action) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();

            if (auth == null || !auth.isAuthenticated())
                return false;
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null)
                return false;
            if (isPrivileged(user))
                return true;
            if (user.getEmployee() == null)
                return false;
            Long employeeId = user.getEmployee().getId();
            String tenantId = TenantContext.getTenantId();
            Tenant tenant = tenantRepository.findByTenantId(tenantId).orElse(null);
            if (tenant == null)
                return false;
            Optional<CrmUserRoleAssignment> assignment = assignmentRepository
                    .findByTenant_IdAndEmployeeId(tenant.getId(), employeeId);
            if (assignment.isEmpty())
                return false;
            Long roleId = assignment.get().getRole().getId();
            Optional<CrmRoleModulePermission> perm = modulePermissionRepository.findByRole_IdAndModule(roleId, module);
            if (perm.isEmpty())
                return false;
            CrmRoleModulePermission p = perm.get();
            return switch (action) {
                case "view" -> Boolean.TRUE.equals(p.getCanView());
                case "create" -> Boolean.TRUE.equals(p.getCanCreate());
                case "update" -> Boolean.TRUE.equals(p.getCanUpdate());
                case "delete" -> Boolean.TRUE.equals(p.getCanDelete());
                case "export" -> Boolean.TRUE.equals(p.getCanExport());
                case "import" -> Boolean.TRUE.equals(p.getCanImport());
                case "changeOwner" -> Boolean.TRUE.equals(p.getCanChangeOwner());
                case "sendEmail" -> Boolean.TRUE.equals(p.getCanSendEmail());
                default -> false;
            };
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isOwnerOnly(String module) {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated())
                return false;
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null)
                return false;
            if (isPrivileged(user))
                return false; // Admins are NEVER owner-only restricted
            if (user.getEmployee() == null)
                return false;
            Long employeeId = user.getEmployee().getId();
            String tenantId = TenantContext.getTenantId();
            Tenant tenant = tenantRepository.findByTenantId(tenantId).orElse(null);
            if (tenant == null)
                return false;
            Optional<CrmUserRoleAssignment> assignment = assignmentRepository
                    .findByTenant_IdAndEmployeeId(tenant.getId(), employeeId);
            if (assignment.isEmpty())
                return false;
            Long roleId = assignment.get().getRole().getId();
            Optional<CrmRoleModulePermission> perm = modulePermissionRepository.findByRole_IdAndModule(roleId, module);
            if (perm.isEmpty())
                return false;
            CrmRoleModulePermission p = perm.get();
            return Boolean.TRUE.equals(p.getOwnerOnly());
        } catch (Exception e) {
            return false;
        }
    }

    public Long getCurrentEmployeeId() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated())
                return null;
            String email = auth.getName();
            User user = userRepository.findByEmail(email).orElse(null);
            if (user == null || user.getEmployee() == null)
                return null;
            return user.getEmployee().getId();
        } catch (Exception e) {
            return null;
        }
    }

    private boolean isPrivileged(User user) {
        return user.getRoles() != null &&
                (user.getRoles().contains(Role.SUPER_ADMIN) ||
                        user.getRoles().contains(Role.CRM_ADMIN));
    }
}
