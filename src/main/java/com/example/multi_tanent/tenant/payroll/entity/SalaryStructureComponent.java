package com.example.multi_tanent.tenant.payroll.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "salary_structure_components")
@Data
public class SalaryStructureComponent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_structure_id", nullable = false)
    private SalaryStructure salaryStructure;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salary_component_id", nullable = false)
    private SalaryComponent salaryComponent;

    // The value for this component, can be a fixed amount or a percentage
    @Column(precision = 15, scale = 2)
    private BigDecimal value;

    // Or a formula overriding the component's default
    private String formula;
}