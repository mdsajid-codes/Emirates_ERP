package com.example.multi_tanent.tenant.payroll.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.payroll.enums.TerminationReason;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "end_of_service")
@Data
public class EndOfService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false, unique = true)
    private Employee employee;

    @Column(nullable = false, name = "joining_date")
    private LocalDate joiningDate;

    @Column(nullable = false, name = "last_working_day")
    private LocalDate lastWorkingDay;

    @Column(nullable = false, precision = 10, scale = 4, name = "total_years_of_service")
    private BigDecimal totalYearsOfService;

    @Column(nullable = false, precision = 15, scale = 2, name = "last_basic_salary")
    private BigDecimal lastBasicSalary;

    @Column(nullable = false, precision = 15, scale = 2, name = "gratuity_amount")
    private BigDecimal gratuityAmount;

    @Column(length = 1000, name = "calculation_details")
    private String calculationDetails; // Store a summary of the calculation logic used

    @Enumerated(EnumType.STRING)
    @Column(name = "termination_reason")
    private TerminationReason terminationReason;

    @Column(name = "is_paid")
    private Boolean isPaid = false;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "calculated_at")
    private LocalDateTime calculatedAt;

}