package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_units", uniqueConstraints = {
        @UniqueConstraint(name = "uk_pro_unit_tenant_code", columnNames = { "tenant_id", "code" })
})
public class ProUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id") // Optional: to make this unit location-specific
    private Location location;

    @NotBlank
    @Column(name = "name", nullable = false)
    private String name; // e.g., "Unit1", "kg", "pcs"
    /**
     * The conversion rate to a base unit.
     * For a base unit itself (e.g., Gram), this would be 1.0.
     * For a derived unit (e.g., Kilogram), this would be 1000.
     */
    @Column(name = "description", length = 100)
    private String description;
}
