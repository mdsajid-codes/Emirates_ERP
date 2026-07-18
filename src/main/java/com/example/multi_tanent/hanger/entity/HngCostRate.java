package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hng_cost_rate")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngCostRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "rate_key", nullable = false, length = 50)
    private String rateKey; // e.g., ELECTRICITY, LABOR_PER_HOUR, PAINT_PER_KG

    @Column(name = "rate_label", nullable = false, length = 100)
    private String rateLabel;

    @Column(name = "rate_value", nullable = false, precision = 12, scale = 4)
    private BigDecimal rateValue;

    @Column(name = "unit", length = 20)
    private String unit; // e.g., kWh, hour, kg

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "is_active")
    private Boolean isActive;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
