package com.example.multi_tanent.crm.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmModulePermissionDto {
    private String module;
    private Boolean canView;
    private Boolean canCreate;
    private Boolean canUpdate;
    private Boolean canDelete;
    private Boolean canExport;
    private Boolean canImport;
    private Boolean canChangeOwner;
    private Boolean canSendEmail;
    private Boolean ownerOnly;
}
