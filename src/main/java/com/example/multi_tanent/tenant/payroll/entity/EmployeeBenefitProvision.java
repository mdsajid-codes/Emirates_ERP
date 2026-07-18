package com.example.multi_tanent.tenant.payroll.entity;

import com.example.multi_tanent.tenant.payroll.enums.PaymentMethod;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.payroll.enums.ProvisionStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "employee_benefit_provisions")
@Data
public class EmployeeBenefitProvision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "benefit_type_id", nullable = false)
    private BenefitType benefitType;

    @Column(nullable = false, precision = 15, scale = 2, name = "accrued_amount")
    private BigDecimal accruedAmount; // The amount accrued so far

    @Column(nullable = false, name = "cycle_start_date")
    private LocalDate cycleStartDate;

    @Column(nullable = false, name = "cycle_end_date")
    private LocalDate cycleEndDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "status")
    private ProvisionStatus status; // e.g., ACCRUING, PAID_OUT, EXPIRED

    // --- New fields for payout confirmation ---
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    @Column(precision = 15, scale = 2, name = "paid_amount")
    private BigDecimal paidAmount;

    @Column(name = "paid_out_date")
    private LocalDate paidOutDate;

    @Column(length = 500, name = "payment_details")
    private String paymentDetails; // e.g., "Ticket booked on Emirates EK201", "Cash equivalent paid via payroll"

    @OneToMany(mappedBy = "provision", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BenefitPayoutFile> confirmationFiles = new ArrayList<>();

}