package com.example.multi_tanent.tenant.payroll.entity;

import com.example.multi_tanent.tenant.payroll.enums.CalculationType;
import java.math.BigDecimal;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "benefit_types")
@Data
public class BenefitType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // e.g., "ANNUAL_TICKET", "HEALTH_INSURANCE"

    @Column(nullable = false)
    private String name; // e.g., "Annual Air Ticket", "Health Insurance"

    @Column(length = 500)
    private String description;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "calculation_type")
    private CalculationType calculationType; // e.g., FLAT_AMOUNT or PERCENTAGE_OF_BASIC

    @Column(precision = 15, scale = 2, name = "value_for_accrual")
    private BigDecimal valueForAccrual;
}
