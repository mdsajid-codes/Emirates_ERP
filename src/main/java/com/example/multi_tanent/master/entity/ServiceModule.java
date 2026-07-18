package com.example.multi_tanent.master.entity;

import java.util.Arrays;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Represents a single, selectable service module for a tenant.
 * Each module corresponds to a feature set and its associated database
 * entities.
 */
public enum ServiceModule {
    // Foundational module, always included.
    USER(true, "com.example.multi_tanent.spersusers.enitity"),

    // HRMS Modules
    HRMS_ATTENDANCE(false, "com.example.multi_tanent.tenant.attendance.entity"),
    HRMS_CORE(false, "com.example.multi_tanent.tenant.base.entity", "com.example.multi_tanent.tenant.employee.entity",
            USER, HRMS_ATTENDANCE),
    HRMS_LEAVE(false, "com.example.multi_tanent.tenant.leave.entity"),
    HRMS_PAYROLL(false, "com.example.multi_tanent.tenant.payroll.entity"),
    HRMS_RECRUITMENT(false, "com.example.multi_tanent.tenant.recruitment.entity"),

    // Point of Sale (POS) Module
    POS(false, "com.example.multi_tanent.pos.entity", USER),

    // Accounts Module
    ACCOUNTS(false, "com.example.multi_tanent.accounts.entity", USER),

    // Sales Module — declared before CRM because CRM depends on it
    SALES(false, "com.example.multi_tanent.sales.entity", USER),

    // CRM Module — depends on SALES for quotation/deal data and HRMS_CORE for
    // employee assignment features
    CRM(false, "com.example.multi_tanent.crm.entity", USER, SALES, HRMS_CORE),

    // Purchase Module
    PURCHASE(false, "com.example.multi_tanent.purchases.entity", USER),

    // Production Module
    PRODUCTION(false, "com.example.multi_tanent.production.entity", USER),

    // Material Requisition Module
    MATERIAL(false, "com.example.multi_tanent.materials.entity", PRODUCTION),

    // Warehouse Module
    WAREHOUSE(false, "com.example.multi_tanent.warehouse.entity", "com.example.multi_tanent.fleet.entity", USER),

    // Supplier Tendering Module
    SUPPLIER_TENDERING(false, "com.example.multi_tanent.purchases.entity", USER),

    // RFQ Management Module
    RFQ_MANAGEMENT(false, "com.example.multi_tanent.purchases.entity", USER),
    // Project Management Module
    PROJECT_MANAGEMENT(false, "com.example.multi_tanent.project_management.entity", USER),

    // Hanger Manufacturing ERP Module (special tenant only)
    HANGER_MANUFACTURING(false, "com.example.multi_tanent.hanger.entity", PRODUCTION, WAREHOUSE, SALES, PURCHASE,
            ACCOUNTS),

    // Trip Management Module
    TRIP_MANAGEMENT(false, "com.example.multi_tanent.fleet.entity", WAREHOUSE, USER),

    // Fixed Asset Module
    FIXED_ASSETS(false, "com.example.multi_tanent.fixedasset.entity", USER),

    // Notification Module
    NOTIFICATION(false, "com.example.multi_tanent.spersusers.enitity.notification.entity", USER),

    // Applicant Tracking System
    ATS(false, "com.example.multi_tanent.ats.entity", USER);

    private final boolean isFoundation;
    private final List<String> entityPackages;
    private final List<ServiceModule> dependencies;

    ServiceModule(boolean isFoundation, String entityPackage, ServiceModule... dependencies) {
        this.isFoundation = isFoundation;
        this.entityPackages = List.of(entityPackage);
        this.dependencies = List.of(dependencies);
    }

    ServiceModule(boolean isFoundation, String pkg1, String pkg2, ServiceModule... dependencies) {
        this.isFoundation = isFoundation;
        this.entityPackages = List.of(pkg1, pkg2);
        this.dependencies = List.of(dependencies);
    }

    public static Set<ServiceModule> resolveWithDependencies(List<ServiceModule> modules) {
        if (modules == null) {
            return Set.of();
        }
        Set<ServiceModule> allModules = modules.stream()
                .flatMap(ServiceModule::getSelfAndAllDependencies)
                .collect(Collectors.toSet());
        allModules.addAll(Arrays.stream(values())
                .filter(m -> m.isFoundation)
                .collect(Collectors.toSet()));
        return allModules;
    }

    public static String[] getPackagesForModules(List<ServiceModule> modules) {
        if (modules == null || modules.isEmpty()) {
            return new String[0];
        }

        Set<ServiceModule> allModules = resolveWithDependencies(modules);

        return allModules.stream()
                .flatMap(module -> module.entityPackages.stream())
                .distinct()
                .toArray(String[]::new);
    }

    private Stream<ServiceModule> getSelfAndAllDependencies() {
        return Stream.concat(
                Stream.of(this),
                dependencies.stream().flatMap(ServiceModule::getSelfAndAllDependencies));
    }

    public static String[] getAllPackages() {
        return getPackagesForModules(Arrays.asList(values()));
    }
}