package com.example.multi_tanent.tenant.leave.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "sick_leave_intervals")
@Data
public class SickLeaveInterval {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sick_leave_type_id", nullable = false)
    private SickLeaveType sickLeaveType;

    @Column(name = "from_day", nullable = false)
    private Integer fromDay;

    @Column(name = "to_day", nullable = false)
    private Integer toDay;

    @Column(name = "payment_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal paymentPercent;
}
