package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.*;
import com.example.multi_tanent.crm.services.CrmDefaultRoleSeeder;
import com.example.multi_tanent.crm.services.CrmRoleService;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm/roles")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CRM_ADMIN')")
public class CrmRoleController {

    private final CrmRoleService service;
    private final UserRepository userRepository;
    private final CrmDefaultRoleSeeder defaultRoleSeeder;

    @GetMapping
    public ResponseEntity<List<CrmRoleResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CrmRoleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<CrmRoleResponse> create(@Valid @RequestBody CrmRoleRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CrmRoleResponse> update(@PathVariable Long id, @Valid @RequestBody CrmRoleRequest req) {
        return ResponseEntity.ok(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{roleId}/users/{employeeId}")
    public ResponseEntity<Void> assignUser(@PathVariable Long roleId, @PathVariable Long employeeId) {
        service.assignUser(roleId, employeeId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/users/{employeeId}")
    public ResponseEntity<Void> removeUserAssignment(@PathVariable Long employeeId) {
        service.removeUserAssignment(employeeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/my-permissions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CrmMyPermissionsResponse> getMyPermissions() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // If user is SUPER_ADMIN or CRM_ADMIN, grant all permissions across all modules
        if (user.getRoles().contains(com.example.multi_tanent.master.enums.Role.SUPER_ADMIN) ||
                user.getRoles().contains(com.example.multi_tanent.master.enums.Role.CRM_ADMIN)) {
            return ResponseEntity.ok(generateFullPermissions());
        }

        if (user.getEmployee() == null) {
            // Return empty permissions instead of 500 if no employee record exists
            return ResponseEntity.ok(CrmMyPermissionsResponse.builder()
                    .permissions(new java.util.HashMap<>())
                    .build());
        }

        return ResponseEntity.ok(service.getMyPermissions(user.getEmployee().getId()));
    }

    private CrmMyPermissionsResponse generateFullPermissions() {
        String[] modules = {
                "DASHBOARD", "LEAD", "COMPANY", "CONTACT", "TASK",
                "REMINDER", "PRODUCT", "CALL_LOG", "EVENT", "REPORT",
                "SETTINGS", "ATTACHMENT", "EMAIL", "DEAL", "KPI", "TODO"
        };

        java.util.Map<String, CrmModulePermissionDto> perms = new java.util.HashMap<>();
        for (String m : modules) {
            perms.put(m, CrmModulePermissionDto.builder()
                    .module(m)
                    .canView(true)
                    .canCreate(true)
                    .canUpdate(true)
                    .canDelete(true)
                    .canExport(true)
                    .canImport(true)
                    .canChangeOwner(true)
                    .canSendEmail(true)
                    .build());
        }

        return CrmMyPermissionsResponse.builder().permissions(perms).build();
    }

    @PostMapping("/seed-defaults")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'CRM_ADMIN')")
    public ResponseEntity<Void> seedDefaults() {
        defaultRoleSeeder.seedForCurrentTenant();
        return ResponseEntity.ok().build();
    }
}
