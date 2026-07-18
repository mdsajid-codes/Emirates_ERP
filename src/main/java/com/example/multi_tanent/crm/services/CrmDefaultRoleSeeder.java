package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.crm.entity.CrmRole;
import com.example.multi_tanent.crm.entity.CrmRoleModulePermission;
import com.example.multi_tanent.crm.repository.CrmRoleModulePermissionRepository;
import com.example.multi_tanent.crm.repository.CrmRoleRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmDefaultRoleSeeder {

    private final CrmRoleRepository roleRepository;
    private final CrmRoleModulePermissionRepository permissionRepository;
    private final TenantRepository tenantRepository;

    private static final String[] ALL_MODULES = {
        "DASHBOARD", "LEAD", "COMPANY", "CONTACT", "TASK",
        "REMINDER", "PRODUCT", "CALL_LOG", "EVENT", "REPORT",
        "SETTINGS", "ATTACHMENT", "EMAIL", "DEAL", "KPI", "TODO"
    };

    public void seedForTenant(Long tenantId) {
        Tenant tenant = tenantRepository.findById(tenantId).orElse(null);
        if (tenant == null) return;
        seedForTenantEntity(tenant);
    }

    public void seedForCurrentTenant() {
        String tenantId = com.example.multi_tanent.config.TenantContext.getTenantId();
        if (tenantId == null) return;
        Tenant tenant = tenantRepository.findByTenantId(tenantId).orElse(null);
        if (tenant == null) return;
        seedForTenantEntity(tenant);
    }

    public void seedForTenantEntity(Tenant tenant) {
        // Role 1: CRM Administrator
        seedRole(tenant, "CRM Administrator", "Full access to all CRM modules and settings.", ALL_MODULES, true, true, true, true, true, true, true, true);

        // Role 2: Sales Manager
        seedSalesManager(tenant);

        // Role 3: Sales Representative
        seedSalesRepresentative(tenant);

        // Role 4: Support Agent
        seedSupportAgent(tenant);

        // Role 5: Read-Only Viewer
        seedRole(tenant, "Read-Only Viewer", "Can view all modules but cannot make any updates or changes.", ALL_MODULES, true, false, false, false, false, false, false, false);
    }

    private void seedSalesManager(Tenant tenant) {
        String roleName = "Sales Manager";
        CrmRole role = getOrCreateRole(tenant, roleName, "Full access to lead management and sales operations. Read-only access to products and settings.");
        
        for (String module : ALL_MODULES) {
            if (permissionRepository.findByRole_IdAndModule(role.getId(), module).isPresent()) continue;

            CrmRoleModulePermission.CrmRoleModulePermissionBuilder builder = CrmRoleModulePermission.builder()
                    .role(role)
                    .module(module)
                    .canView(true);

            if (module.equals("LEAD") || module.equals("COMPANY") || module.equals("CONTACT") || 
                module.equals("TASK") || module.equals("CALL_LOG") || module.equals("EVENT")) {
                builder.canCreate(true).canUpdate(true).canDelete(true).canExport(true).canImport(true).canChangeOwner(true).canSendEmail(true);
            } else if (module.equals("ATTACHMENT") || module.equals("EMAIL")) {
                builder.canCreate(true).canSendEmail(true).canUpdate(false).canDelete(false).canExport(false).canImport(false).canChangeOwner(false);
            } else {
                builder.canCreate(false).canUpdate(false).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(false);
            }
            permissionRepository.save(builder.build());
        }
    }

    private void seedSalesRepresentative(Tenant tenant) {
        String roleName = "Sales Representative";
        CrmRole role = getOrCreateRole(tenant, roleName, "Manage assigned leads and activities. View dashboards and basic product lists.");
        
        for (String module : ALL_MODULES) {
            if (permissionRepository.findByRole_IdAndModule(role.getId(), module).isPresent()) continue;

            CrmRoleModulePermission.CrmRoleModulePermissionBuilder builder = CrmRoleModulePermission.builder()
                    .role(role)
                    .module(module)
                    .canView(true);

            if (module.equals("LEAD") || module.equals("COMPANY") || module.equals("CONTACT")) {
                builder.canCreate(true).canUpdate(true).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(true);
                if (module.equals("LEAD")) {
                    builder.ownerOnly(true);
                }
            } else if (module.equals("CALL_LOG") || module.equals("TASK")) {
                builder.canCreate(true).canUpdate(true).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(false);
                builder.ownerOnly(true);
            } else if (module.equals("EVENT")) {
                builder.canCreate(true).canUpdate(false).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(false);
            } else if (module.equals("EMAIL")) {
                builder.canCreate(false).canUpdate(false).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(true);
            } else if (module.equals("ATTACHMENT")) {
                builder.canCreate(true).canUpdate(false).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(false);
            } else if (module.equals("DASHBOARD") || module.equals("PRODUCT") || module.equals("SETTINGS") || module.equals("TODO")) {
                builder.canCreate(false).canUpdate(false).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(false);
            } else {
                builder.canView(false).canCreate(false).canUpdate(false).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(false);
            }
            permissionRepository.save(builder.build());
        }
    }

    private void seedSupportAgent(Tenant tenant) {
        String roleName = "Support Agent";
        CrmRole role = getOrCreateRole(tenant, roleName, "Manage communications and tasks. View leads and company info.");
        
        for (String module : ALL_MODULES) {
            if (permissionRepository.findByRole_IdAndModule(role.getId(), module).isPresent()) continue;

            CrmRoleModulePermission.CrmRoleModulePermissionBuilder builder = CrmRoleModulePermission.builder()
                    .role(role)
                    .module(module);

            if (module.equals("CONTACT") || module.equals("TASK") || module.equals("CALL_LOG")) {
                builder.canView(true).canCreate(true).canUpdate(true).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(false);
            } else if (module.equals("LEAD") || module.equals("EMAIL") || module.equals("DASHBOARD") || module.equals("SETTINGS")) {
                builder.canView(true).canCreate(false).canUpdate(false).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(false);
            } else {
                builder.canView(false).canCreate(false).canUpdate(false).canDelete(false).canExport(false).canImport(false).canChangeOwner(false).canSendEmail(false);
            }
            permissionRepository.save(builder.build());
        }
    }

    private void seedRole(Tenant tenant, String roleName, String description, String[] modules,
                          boolean view, boolean create, boolean update, boolean delete,
                          boolean export, boolean jImport, boolean changeOwner, boolean sendEmail) {
        CrmRole role = getOrCreateRole(tenant, roleName, description);
        
        for (String module : modules) {
            if (permissionRepository.findByRole_IdAndModule(role.getId(), module).isPresent()) continue;

            CrmRoleModulePermission perm = CrmRoleModulePermission.builder()
                    .role(role)
                    .module(module)
                    .canView(view)
                    .canCreate(create)
                    .canUpdate(update)
                    .canDelete(delete)
                    .canExport(export)
                    .canImport(jImport)
                    .canChangeOwner(changeOwner)
                    .canSendEmail(sendEmail)
                    .build();
            permissionRepository.save(perm);
        }
    }

    private CrmRole getOrCreateRole(Tenant tenant, String name, String description) {
        Optional<CrmRole> existing = roleRepository.findByTenantIdAndNameIgnoreCase(tenant.getId(), name);
        if (existing.isPresent()) {
            return existing.get();
        }
        CrmRole newRole = CrmRole.builder()
                .tenant(tenant)
                .name(name)
                .description(description)
                .build();
        return roleRepository.save(newRole);
    }
}
