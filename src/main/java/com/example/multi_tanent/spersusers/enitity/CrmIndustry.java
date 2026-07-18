package com.example.multi_tanent.spersusers.enitity;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(

        name = "crm_industries", uniqueConstraints = {
                @UniqueConstraint(name = "uk_industry_tenant_name", columnNames = { "tenant_id", "name" })
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmIndustry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Many industries belong to one tenant */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_industry_tenant"))
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id") // Optional relationship
    private Location location;

    @NotBlank
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
