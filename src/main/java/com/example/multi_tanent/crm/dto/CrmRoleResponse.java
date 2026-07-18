package com.example.multi_tanent.crm.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmRoleResponse {
    private Long id;
    private String name;
    private String description;
    private Long tenantId;
    private Long clonedFromId;
    private List<CrmModulePermissionDto> permissions;
    private int userCount;
}
