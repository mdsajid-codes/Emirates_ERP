package com.example.multi_tanent.tenant.employee.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.attendance.entity.AttendancePolicy;
import com.example.multi_tanent.tenant.base.entity.LeaveGroup;
import com.example.multi_tanent.tenant.base.entity.TimeType;
import com.example.multi_tanent.tenant.base.entity.WorkType;
import com.example.multi_tanent.tenant.base.entity.WeeklyOffPolicy;
import com.example.multi_tanent.tenant.base.entity.WorkSchedule;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Table(name = "time_attendence")
@Setter
@Getter
@ToString(exclude = "employee")
@EqualsAndHashCode(exclude = "employee")
@NoArgsConstructor
@AllArgsConstructor
public class TimeAttendence {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id")
    @JsonBackReference
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "time_type_id")
    private TimeType timeType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_type_id")
    private WorkType workType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weekly_off_policy_id")
    private WeeklyOffPolicy weeklyOffPolicy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_group_id")
    private LeaveGroup leaveGroup;

    @Column(name = "attendence_capture_scheme")
    private String attendenceCaptureScheme;

    @Column(name = "holiday_list")
    private String holidayList;

    @Column(name = "expense_policy")
    private String expensePolicy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendance_policy_id")
    private AttendancePolicy attendancePolicy;

    @Column(name = "is_roster_based_employee")
    private Boolean isRosterBasedEmployee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_schedule_id")
    private WorkSchedule workSchedule;
}
