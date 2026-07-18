package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.enums.Role;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public record ProvisionTenantRequest(
        String tenantId,
        String companyName,
        String adminEmail,
        String adminPassword,
        List<ServiceModule> serviceModules,
        Set<Role> adminRoles,
        // New subscription fields
        Integer numberOfLocations,
        Integer numberOfUsers,
        Integer numberOfStore,
        Integer hrmsAccessCount,
        LocalDate subscriptionStartDate,
        LocalDate subscriptionEndDate
) {}