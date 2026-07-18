package com.example.multi_tanent.tenant.payroll.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "statutory_rules")
@Data
public class StatutoryRule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ruleName; // e.g., "Provident Fund", "ESI", "Professional Tax - Maharashtra"

    private String description;

    // Example for PF
    @Column(precision = 5, scale = 2, name = "employee_contribution_rate")
    private BigDecimal employeeContributionRate; // e.g., 12.00

    @Column(precision = 5, scale = 2, name = "employer_contribution_rate")
    private BigDecimal employerContributionRate; // e.g., 12.00

    @Column(precision = 15, scale = 2, name = "contribution_cap")
    private BigDecimal contributionCap; // e.g., 15000.00

    // Example for Professional Tax (can be a JSON string for slab-based rules)
    @Lob
    @Column(columnDefinition = "longtext", name = "tax_slabs_json")
    private String taxSlabsJson;

    @Column(name = "is_active")
    private Boolean isActive;
}