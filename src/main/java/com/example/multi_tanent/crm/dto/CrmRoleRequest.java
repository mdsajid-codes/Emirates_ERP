package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmRoleRequest {
    @NotBlank(message = "Role name is required")
    private String name;
    
    private String description;
    
    private Long cloneRoleId;
    
    private List<CrmModulePermissionDto> permissions;
}
