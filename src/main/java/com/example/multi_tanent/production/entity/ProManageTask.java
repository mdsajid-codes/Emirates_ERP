package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.Location;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_manage_tasks")
public class ProManageTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    /** Optional: The location where this managed task is relevant */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", foreignKey = @ForeignKey(name = "fk_mp_location"))
    private Location location;

    /** Required: Workgroup */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "workgroup_id", foreignKey = @ForeignKey(name = "fk_mp_workgroup"))
    private ProWorkGroup workGroup;

    /** Optional: a specific workstation in that workgroup */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workstation_id", foreignKey = @ForeignKey(name = "fk_mp_workstation"))
    private ProWorkStation workstation;

    /** Required: Task master (e.g., Preventive Maintenance Check) */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", foreignKey = @ForeignKey(name = "fk_mp_task"))
    private ProTask task;

    /** Required: screen “Frequency” */
    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false, length = 20)
    private Frequency frequency;

    /** Screen “Last Date” (last performed) */
    @Column(name = "last_performed_on")
    private LocalDate lastPerformedOn;

    /** “Notification Alert Before” (days) */
    @Column(name = "alert_before_days")
    private Integer alertBeforeDays;

    /** Multi-select “Notification Employees” */
    @ManyToMany
    @JoinTable(name = "pro_manage_task_notifications", joinColumns = @JoinColumn(name = "plan_id"), inverseJoinColumns = @JoinColumn(name = "employee_id"))
    private Set<Employee> notifyEmployees = new HashSet<>();

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public enum Frequency {
        DAILY, WEEKLY, MONTHLY, QUARTERLY, YEARLY
    }
}
