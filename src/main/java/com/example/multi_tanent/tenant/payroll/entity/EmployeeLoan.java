package com.example.multi_tanent.tenant.payroll.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.payroll.enums.LoanStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "employee_loans")
@Data
public class EmployeeLoan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_product_id")
    private LoanProduct loanProduct;

    @Column(nullable = false, precision = 15, scale = 2, name = "loan_amount")
    private BigDecimal loanAmount;

    @Column(nullable = false, precision = 15, scale = 2, name = "emi_amount")
    private BigDecimal emiAmount;

    @Column(nullable = false, name = "total_installments")
    private Integer totalInstallments;

    @Column(nullable = false, name = "remaining_installments")
    private Integer remainingInstallments;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "status")
    private LoanStatus status;

    @Column(name = "requested_at")
    private LocalDateTime requestedAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Column(name = "processed_by_user_id")
    private Long processedByUserId;
}