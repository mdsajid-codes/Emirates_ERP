package com.example.multi_tanent.crm.entity;

import com.example.multi_tanent.crm.enums.TaskSubject;
import com.example.multi_tanent.crm.enums.TodoPriority;
import com.example.multi_tanent.crm.enums.TodoStatus;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "crm_todos", indexes = {
                @Index(name = "idx_todos_tenant", columnList = "tenant_id"),
                @Index(name = "idx_todos_due", columnList = "due_date"),
                @Index(name = "idx_todos_status", columnList = "status"),
                @Index(name = "idx_todos_subject", columnList = "subject")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmTodoItem {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(optional = false, fetch = FetchType.LAZY)
        @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_todo_tenant"))
        private Tenant tenant;

        @Enumerated(EnumType.STRING)
        @Column(name = "subject", nullable = false, length = 30)
        private TaskSubject subject; // CALL/MEETING/EVENT/TASK/OTHER

        @Column(name = "description", columnDefinition = "TEXT")
        private String description;

        @Column(name = "due_date")
        private LocalDate dueDate;

        @Column(name = "from_time")
        private LocalTime fromTime;

        @Column(name = "to_time")
        private LocalTime toTime;

        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 30)
        @Builder.Default
        private TodoStatus status = TodoStatus.OPEN;

        @Enumerated(EnumType.STRING)
        @Column(name = "priority", nullable = false, length = 15)
        @Builder.Default
        private TodoPriority priority = TodoPriority.NORMAL;

        /** Optional quick text for customer name in the form */
        @Column(name = "customer_contact_name", length = 200)
        private String customerContactName;

        // Link to the lead this todo is for
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "lead_id", foreignKey = @ForeignKey(name = "fk_crm_todo_lead"))
        private CrmLead lead;

        /** Primary assignee (optional) */
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "assigned_to_id", foreignKey = @ForeignKey(name = "fk_todo_assigned_to"))
        private Employee assignedTo;

        /** Participants (multi-select employees) */
        @ManyToMany
        @JoinTable(name = "crm_todo_employees", joinColumns = @JoinColumn(name = "todo_id"), inverseJoinColumns = @JoinColumn(name = "employee_id"))
        @Builder.Default
        private Set<Employee> employees = new LinkedHashSet<>();

        /** Related contacts */
        @ManyToMany
        @JoinTable(name = "crm_todo_contacts", joinColumns = @JoinColumn(name = "todo_id"), inverseJoinColumns = @JoinColumn(name = "contact_id"))
        @Builder.Default
        private Set<Contact> contacts = new LinkedHashSet<>();

        /** Labels (All/Starred/new label UI) */
        @ManyToMany
        @JoinTable(name = "crm_todo_labels_link", joinColumns = @JoinColumn(name = "todo_id"), inverseJoinColumns = @JoinColumn(name = "label_id"))
        @Builder.Default
        private Set<CrmTodoLabel> labels = new LinkedHashSet<>();

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
