package com.example.multi_tanent.crm.entity;



import com.example.multi_tanent.crm.enums.TaskSubject;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
// import com.example.multi_tanent.crm.entity.enums.TaskSubject;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Entity
@Table(name = "crm_tasks",
       indexes = {
         @Index(name = "idx_crm_tasks_tenant", columnList = "tenant_id"),
         @Index(name = "idx_crm_tasks_due", columnList = "due_date")
       })
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTask {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Multi-tenant
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false,
                foreignKey = @ForeignKey(name = "fk_crm_task_tenant"))
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "subject", nullable = false, length = 30)
    private TaskSubject subject;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "call_time")
    private LocalTime callTime;

    // Link to the lead this task is for
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lead_id", foreignKey = @ForeignKey(name = "fk_crm_task_lead"))
    private CrmLead lead;

    // Primary assignee (single)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id",
            foreignKey = @ForeignKey(name = "fk_crm_task_assigned_to"))
    private Employee assignedTo;

    // Additional employees (multi-select)
    @ManyToMany
    @JoinTable(
        name = "crm_task_employees",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "employee_id")
    )
    @Builder.Default
    private Set<Employee> employees = new LinkedHashSet<>();

    // Related contacts (multi-select)
    @ManyToMany
    @JoinTable(
        name = "crm_task_contacts",
        joinColumns = @JoinColumn(name = "task_id"),
        inverseJoinColumns = @JoinColumn(name = "contact_id")
    )
    @Builder.Default
    private Set<Contact> contacts = new LinkedHashSet<>();

    // Optional status if you want later (Open/Done etc.)
    @Column(name = "status", length = 30)
    private String status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
