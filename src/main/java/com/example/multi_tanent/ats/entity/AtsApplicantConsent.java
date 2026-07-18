package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.ats.enums.ConsentStatus;
import com.example.multi_tanent.ats.enums.EmailStatus;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_applicant_consents", indexes = {
        @Index(name = "idx_consent_tenant_status", columnList = "tenant_id,consent_status"),
        @Index(name = "idx_consent_applicant", columnList = "applicant_id"),
        @Index(name = "idx_consent_token", columnList = "consent_token")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsApplicantConsent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_consent_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_consent_applicant"))
    private AtsApplicant applicant;

    @Enumerated(EnumType.STRING)
    @Column(name = "consent_status", nullable = false, length = 30)
    @Builder.Default
    private ConsentStatus consentStatus = ConsentStatus.PENDING;

    @Column(name = "email_sent_to", nullable = false, length = 150)
    private String emailSentTo;

    @Enumerated(EnumType.STRING)
    @Column(name = "email_status", nullable = false, length = 30)
    @Builder.Default
    private EmailStatus emailStatus = EmailStatus.PENDING;

    @Column(name = "consent_sent_at", nullable = false)
    private OffsetDateTime consentSentAt;

    @Column(name = "responded_at")
    private OffsetDateTime respondedAt;

    @Column(name = "consent_token", unique = true, length = 255)
    private String consentToken;

    @Column(name = "token_expiry")
    private OffsetDateTime tokenExpiry;

    @Column(name = "rejection_reason", length = 1000)
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sent_by_id", foreignKey = @ForeignKey(name = "fk_consent_sent_by"))
    private Employee sentBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
