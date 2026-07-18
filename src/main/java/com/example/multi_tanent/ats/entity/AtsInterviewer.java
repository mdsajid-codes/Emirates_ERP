package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_interviewers", indexes = {
        @Index(name = "idx_ats_interviewer_tenant", columnList = "tenant_id"),
        @Index(name = "idx_ats_interviewer_email", columnList = "tenant_id,email")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsInterviewer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_interviewer_tenant"))
    private Tenant tenant;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "job_title", length = 150)
    private String jobTitle;

    @Column(name = "mobile_number", length = 30)
    private String mobileNumber;

    @Column(name = "technology", length = 100)
    private String technology;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_unit_id", foreignKey = @ForeignKey(name = "fk_ats_interviewer_bu"))
    private AtsBusinessUnit businessUnit;

    @Column(name = "calendar_sync_notification")
    @Builder.Default
    private Boolean calendarSyncNotification = true;

    @Column(name = "working_hours_start", length = 10)
    private String workingHoursStart;

    @Column(name = "working_hours_end", length = 10)
    private String workingHoursEnd;

    @Column(name = "working_hours_apply_weekends")
    @Builder.Default
    private Boolean workingHoursApplyWeekends = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_by", length = 150)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
