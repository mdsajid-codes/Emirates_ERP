package com.example.multi_tanent.tenant.payroll.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bonuses")
@Data
public class Bonus {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(nullable = false, name = "bonus_type")
    private String bonusType; // e.g., "Performance Bonus", "Festival Bonus"

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, name = "pay_date")
    private LocalDate payDate; // The date this bonus should be considered for payroll

    @Column(length = 1000, name = "remarks")
    private String remarks;
}