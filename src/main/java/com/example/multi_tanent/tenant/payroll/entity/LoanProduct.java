package com.example.multi_tanent.tenant.payroll.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

import java.time.LocalDate;

@Entity
@Table(name = "loan_products")
@Data
public class LoanProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, name = "product_name")
    private String productName; // e.g., "General Purpose Loan", "Emergency Loan"

    @Column(name = "description")
    private String description;

    @Column(precision = 5, scale = 2, name = "interest_rate")
    private BigDecimal interestRate; // Annual interest rate

    @Column(name = "max_installments")
    private Integer maxInstallments;

    @Column(precision = 15, scale = 2, name = "max_loan_amount")
    private BigDecimal maxLoanAmount;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "availability_start_date")
    private LocalDate availabilityStartDate;

    @Column(name = "availability_end_date")
    private LocalDate availabilityEndDate;

    @Column(nullable = false, name = "deduct_from_salary")
    private Boolean deductFromSalary = true;
}