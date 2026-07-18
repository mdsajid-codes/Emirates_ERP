package com.example.multi_tanent.tenant.attendance.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.base.entity.ShiftType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "employee_shift_assignments",
    uniqueConstraints = @UniqueConstraint(columnNames = {"employee_id", "assigned_date"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeShiftAssignment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(optional = false)
    @JoinColumn(name = "shift_type_id", nullable = false)
    private ShiftType shiftType;

    @Column(name = "assigned_date", nullable = false)
    private LocalDate assignedDate;

    @Column(length = 500)
    private String notes;
}
