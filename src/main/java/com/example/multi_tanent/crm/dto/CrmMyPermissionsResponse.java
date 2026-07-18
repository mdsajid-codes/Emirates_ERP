package com.example.multi_tanent.crm.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmMyPermissionsResponse {
    private Map<String, CrmModulePermissionDto> permissions;
}
