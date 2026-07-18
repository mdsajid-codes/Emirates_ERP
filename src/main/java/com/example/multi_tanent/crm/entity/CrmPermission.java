package com.example.multi_tanent.crm.entity;

// Tenant is referenced; adapt the package/class to your project


import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crm_permissions", uniqueConstraints = {
    @UniqueConstraint(name = "uk_permission_code", columnNames = {"code"})
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmPermission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String code;     // e.g. "LEAD_CREATE", "ROLE_EDIT"

    @Column(length = 150)
    private String name;

    @Column(length = 500)
    private String description;
}
