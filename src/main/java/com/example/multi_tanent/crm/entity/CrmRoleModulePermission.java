package com.example.multi_tanent.crm.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import static jakarta.persistence.GenerationType.IDENTITY;

@Entity
@Table(name = "crm_role_module_permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmRoleModulePermission {

    @Id
    @GeneratedValue(strategy = IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnore
    private CrmRole role;

    @Column(name = "module", nullable = false, length = 50)
    private String module; // "LEAD", "TASK", "COMPANY", etc.

    @Column(name = "can_view")
    private Boolean canView;

    @Column(name = "can_create")
    private Boolean canCreate;

    @Column(name = "can_update")
    private Boolean canUpdate;

    @Column(name = "can_delete")
    private Boolean canDelete;

    @Column(name = "can_export")
    private Boolean canExport;

    @Column(name = "can_import")
    private Boolean canImport;

    @Column(name = "can_change_owner")
    private Boolean canChangeOwner;

    @Column(name = "can_send_email")
    private Boolean canSendEmail;

    @Column(name = "owner_only")
    @Builder.Default
    private Boolean ownerOnly = false;
}
