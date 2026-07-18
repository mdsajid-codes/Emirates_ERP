package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_vendor_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "vendor")
@EqualsAndHashCode(exclude = "vendor")
public class AtsVendorNote {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_note_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_note_vendor"))
    @JsonBackReference("vendor-notes")
    private AtsVendor vendor;

    @Column(name = "note_title", nullable = false, length = 300)
    private String noteTitle;

    @Column(name = "note_body", columnDefinition = "TEXT")
    private String noteBody;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "action_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_note_action"))
    private AtsAction action;

    @Enumerated(EnumType.STRING)
    @Column(name = "notes_priority", length = 50)
    private com.example.multi_tanent.ats.enums.TaskPriority notesPriority;

    @Column(name = "note_header", length = 500)
    private String noteHeader;

    @Column(name = "remind_me")
    @Builder.Default
    private Boolean remindMe = false;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "ats_vendor_note_notifications",
        joinColumns = @JoinColumn(name = "note_id"),
        inverseJoinColumns = @JoinColumn(name = "employee_id"),
        foreignKey = @ForeignKey(name = "fk_ats_vn_notification_note"),
        inverseForeignKey = @ForeignKey(name = "fk_ats_vn_notification_emp")
    )
    @Builder.Default
    private java.util.List<Employee> notifyPeople = new java.util.ArrayList<>();

    @Column(name = "is_pinned")
    @Builder.Default
    private Boolean isPinned = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_note_created_by"))
    private Employee createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
