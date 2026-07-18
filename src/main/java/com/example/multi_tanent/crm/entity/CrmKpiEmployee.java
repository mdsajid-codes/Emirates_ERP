package com.example.multi_tanent.crm.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "crm_kpi_employees", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "kpi_id", "employee_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CrmKpiEmployee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "kpi_id", nullable = false)
    private CrmKpi kpi;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    // Target value for this specific employee for this KPI
    @Column(precision = 15, scale = 2, name = "target_value")
    private BigDecimal targetValue;
}