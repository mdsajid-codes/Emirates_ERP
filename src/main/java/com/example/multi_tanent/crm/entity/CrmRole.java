package com.example.multi_tanent.crm.entity;



import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import com.example.multi_tanent.spersusers.enitity.Tenant;

import java.time.OffsetDateTime;

@Entity
@Table(name = "roles",
       uniqueConstraints = @UniqueConstraint(name = "uk_role_tenant_name", columnNames = {"tenant_id", "name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmRole {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_role_tenant"))
    private Tenant tenant;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 500)
    private String description;

    // store which role it was cloned from (optional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cloned_from_id", foreignKey = @ForeignKey(name = "fk_role_cloned_from"))
    private CrmRole clonedFrom;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
