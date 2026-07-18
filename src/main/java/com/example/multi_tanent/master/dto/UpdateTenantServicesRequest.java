package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.enums.Role;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.Set;

public record UpdateTenantServicesRequest(
        @NotEmpty(message = "At least one service module is required")
        List<ServiceModule> serviceModules,

        Set<Role> adminRoles
) {
}