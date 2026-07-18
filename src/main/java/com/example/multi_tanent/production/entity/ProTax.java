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
@Table(name = "pro_taxes", uniqueConstraints = {
        @UniqueConstraint(name = "uk_pro_tax_tenant_code", columnNames = { "tenant_id", "code" })
})
public class ProTax {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id") // Optional: to make this tax location-specific
    private Location location;

    @NotBlank
    @Column(name = "code", nullable = false, length = 50)
    private String code; // e.g., "VAT5", "GST18"

    @Column(name = "rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal rate = BigDecimal.ZERO; // percentage

    @Column(name = "description", length = 255)
    private String description;
}
