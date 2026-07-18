package com.example.multi_tanent.crm.entity;



import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "role_permissions",
       uniqueConstraints = @UniqueConstraint(name = "uk_role_permission", columnNames = {"role_id","permission_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmRolePermission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_roleperm_role"))
    private CrmRole role;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "permission_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_roleperm_permission"))
    private CrmPermission permission;
}

