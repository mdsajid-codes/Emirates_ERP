package com.example.multi_tanent.spersusers.enitity;

import java.time.OffsetDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "crm_products", uniqueConstraints = {
        @UniqueConstraint(name = "uk_product_tenant_name", columnNames = { "tenant_id", "name" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Many products belong to one tenant */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_product_tenant"))
    private Tenant tenant;

    /** Product belongs to one industry (of same tenant) */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_id", nullable = false, foreignKey = @ForeignKey(name = "fk_product_industry"))
    private CrmIndustry industry;

    /** Optional: The location where this product is relevant */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", foreignKey = @ForeignKey(name = "fk_product_location"))
    private Location location;

    @NotBlank
    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
