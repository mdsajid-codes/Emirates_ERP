package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.ats.enums.TaskPriority;
import com.example.multi_tanent.ats.enums.TaskStatus;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_client_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "client")
@EqualsAndHashCode(exclude = "client")
public class AtsClientTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_task_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_task_client"))
    @JsonBackReference("client-tasks")
    private AtsClient client;

    @Column(name = "task_title", nullable = false, length = 300)
    private String taskTitle;

    @Column(name = "task_description", length = 2000)
    private String taskDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "task_status", nullable = false, length = 50)
    @Builder.Default
    private TaskStatus taskStatus = TaskStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", nullable = false, length = 50)
    @Builder.Default
    private TaskPriority priority = TaskPriority.MEDIUM;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "task_type", length = 100)
    private String taskType;

    @Column(name = "task_category", length = 100)
    private String taskCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id", foreignKey = @ForeignKey(name = "fk_ats_client_task_assigned_to"))
    private Employee assignedTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "escalate_to_id", foreignKey = @ForeignKey(name = "fk_ats_client_task_escalate_to"))
    private Employee escalateTo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ownership_id", foreignKey = @ForeignKey(name = "fk_ats_client_task_ownership"))
    private Employee ownership;

    @Column(name = "reminder", length = 100)
    private String reminder;

    @Column(name = "meeting_link", length = 1000)
    private String meetingLink;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", foreignKey = @ForeignKey(name = "fk_ats_client_task_created_by"))
    private Employee createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
