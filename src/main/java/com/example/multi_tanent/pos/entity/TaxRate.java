package com.example.multi_tanent.pos.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

import com.example.multi_tanent.spersusers.enitity.Tenant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "tax_rates")
public class TaxRate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal percent; // e.g., 5.00

    private boolean compound = false;
}