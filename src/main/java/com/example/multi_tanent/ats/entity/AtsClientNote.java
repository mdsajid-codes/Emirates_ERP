package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.ats.enums.TaskPriority;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ats_client_notes", indexes = {
        @Index(name = "idx_ats_client_note_tenant", columnList = "tenant_id"),
        @Index(name = "idx_ats_client_note_client", columnList = "client_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"tenant", "client", "notifyPeople"})
@EqualsAndHashCode(exclude = {"tenant", "client", "notifyPeople"})
public class AtsClientNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_note_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_note_client"))
    @JsonBackReference("client-notes")
    private AtsClient client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id", foreignKey = @ForeignKey(name = "fk_ats_client_note_action"))
    private AtsAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "notes_priority", length = 50)
    private TaskPriority notesPriority;

    @Column(name = "note_body", columnDefinition = "TEXT")
    private String noteBody;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "ats_client_note_notifications",
        joinColumns = @JoinColumn(name = "note_id"),
        inverseJoinColumns = @JoinColumn(name = "employee_id"),
        foreignKey = @ForeignKey(name = "fk_ats_cn_notification_note"),
        inverseForeignKey = @ForeignKey(name = "fk_ats_cn_notification_emp")
    )
    @Builder.Default
    private List<Employee> notifyPeople = new ArrayList<>();

    @Column(name = "remind_me")
    @Builder.Default
    private Boolean remindMe = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", foreignKey = @ForeignKey(name = "fk_ats_client_note_created_by"))
    private Employee createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
