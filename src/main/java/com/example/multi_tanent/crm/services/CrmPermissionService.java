package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.crm.dto.CrmPermissionDto;
import com.example.multi_tanent.crm.entity.CrmPermission;
import com.example.multi_tanent.crm.repository.CrmPermissionRepository;
import com.example.multi_tanent.crm.repository.CrmRolePermissionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx") // Assuming permissions are managed within the same transaction manager
public class CrmPermissionService {

    private final CrmPermissionRepository permRepo;
    private final CrmRolePermissionRepository rolePermRepo;

    @Transactional(readOnly = true)
    public List<CrmPermissionDto> getAll() {
        return permRepo.findAllByOrderByCodeAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CrmPermissionDto getById(Long id) {
        CrmPermission perm = permRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CrmPermission not found: " + id));
        return toDto(perm);
    }

    public CrmPermissionDto create(CrmPermissionDto req) {
        if (permRepo.existsByCodeIgnoreCase(req.getCode().trim())) {
            throw new IllegalArgumentException("Permission code already exists.");
        }

        CrmPermission perm = CrmPermission.builder()
                .code(req.getCode().trim().toUpperCase())
                .name(req.getName())
                .description(req.getDescription())
                .build();

        perm = permRepo.save(perm);
        return toDto(perm);
    }

    public CrmPermissionDto update(Long id, CrmPermissionDto req) {
        CrmPermission perm = permRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("CrmPermission not found: " + id));

        String newCode = req.getCode().trim().toUpperCase();
        if (!perm.getCode().equalsIgnoreCase(newCode) && permRepo.existsByCodeIgnoreCase(newCode)) {
            throw new IllegalArgumentException("Permission code already exists.");
        }

        perm.setCode(newCode);
        perm.setName(req.getName());
        perm.setDescription(req.getDescription());

        perm = permRepo.save(perm);
        return toDto(perm);
    }

    public void delete(Long id) {
        if (!permRepo.existsById(id)) {
            throw new EntityNotFoundException("CrmPermission not found: " + id);
        }
        if (rolePermRepo.existsByPermissionId(id)) {
            throw new IllegalStateException("Cannot delete permission: It is currently assigned to one or more roles.");
        }

        permRepo.deleteById(id); // Safe to delete now
    }

    private CrmPermissionDto toDto(CrmPermission entity) {
        return CrmPermissionDto.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .name(entity.getName())
                .description(entity.getDescription())
                .build();
    }
}