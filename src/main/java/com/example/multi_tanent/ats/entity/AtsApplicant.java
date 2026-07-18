package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.ats.enums.*;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ats_applicants", indexes = {
        @Index(name = "idx_ats_applicant_tenant_email", columnList = "tenant_id,email"),
        @Index(name = "idx_ats_applicant_tenant_status", columnList = "tenant_id,applicant_status"),
        @Index(name = "idx_ats_applicant_tenant_created", columnList = "tenant_id,created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsApplicant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /* ---------- Multi-tenant ---------- */
    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_applicant_tenant"))
    private Tenant tenant;

    /* ---------- User Linkage ---------- */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", foreignKey = @ForeignKey(name = "fk_ats_applicant_user"))
    private User user;

    /* ---------- Personal Details ---------- */
    @Column(name = "salutation", length = 20)
    private String salutation;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "nick_name", length = 100)
    private String nickName;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "alternate_email", length = 150)
    private String alternateEmail;

    @Column(name = "home_phone", length = 30)
    private String homePhone;

    @Column(name = "mobile_number", length = 30)
    private String mobileNumber;

    @Column(name = "work_phone", length = 30)
    private String workPhone;

    @Column(name = "other_phone", length = 30)
    private String otherPhone;

    @Column(name = "skype_id", length = 100)
    private String skypeId;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "facebook_url", length = 500)
    private String facebookUrl;

    @Column(name = "twitter_url", length = 500)
    private String twitterUrl;

    @Column(name = "video_reference", length = 500)
    private String videoReference;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_authorization", length = 50)
    private WorkAuthorization workAuthorization;

    @Column(name = "work_auth_expiry")
    private LocalDate workAuthExpiry;

    @Column(name = "has_clearance")
    @Builder.Default
    private Boolean hasClearance = false;

    @Embedded
    private AtsApplicantAddress address;

    /* ---------- Extended / Recruitment Details ---------- */
    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 50)
    private ApplicantSource source;

    @Column(name = "experience_years")
    private Integer experienceYears;

    @Column(name = "experience_months")
    private Integer experienceMonths;

    @Column(name = "referred_by", length = 200)
    private String referredBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "applicant_status", length = 50, nullable = false)
    @Builder.Default
    private ApplicantStatus applicantStatus = ApplicantStatus.NEW_LEAD;

    @Column(name = "applicant_group", length = 200)
    private String applicantGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", foreignKey = @ForeignKey(name = "fk_ats_applicant_owner"))
    private Employee owner;

    @Column(name = "job_title", nullable = false, length = 200)
    private String jobTitle;

    @Column(name = "expected_pay_amount", precision = 15, scale = 2)
    private BigDecimal expectedPayAmount;

    @Column(name = "expected_pay_currency", length = 10)
    private String expectedPayCurrency;

    @Column(name = "expected_pay_period", length = 20)
    private String expectedPayPeriod; // HOURLY, DAILY, WEEKLY, MONTHLY, YEARLY

    @Column(name = "additional_comments", length = 4000)
    private String additionalComments;

    @Column(name = "willing_to_relocate")
    @Builder.Default
    private Boolean willingToRelocate = false;

    @Column(name = "primary_skills", length = 2000)
    private String primarySkills;

    @Column(name = "technology", length = 300)
    private String technology;

    @Enumerated(EnumType.STRING)
    @Column(name = "tax_terms", length = 50)
    private TaxTerms taxTerms;

    @Enumerated(EnumType.STRING)
    @Column(name = "notice_period", length = 50)
    private NoticePeriod noticePeriod;

    @Column(name = "gpa", precision = 4, scale = 2)
    private BigDecimal gpa;

    @Column(name = "aadhar_number", length = 20)
    private String aadharNumber;

    @Column(name = "nationality", length = 100)
    private String nationality;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(name = "is_blacklisted")
    @Builder.Default
    private Boolean isBlacklisted = false;

    @Column(name = "blacklist_reason", length = 1000)
    private String blacklistReason;

    @Column(name = "blacklisted_by", length = 150)
    private String blacklistedBy;

    @Column(name = "blacklisted_date")
    private OffsetDateTime blacklistedDate;

    /* ---------- EEO Details ---------- */
    @Enumerated(EnumType.STRING)
    @Column(name = "gender", length = 30)
    private Gender gender;

    @Column(name = "race_ethnicity", length = 100)
    private String raceEthnicity;

    @Enumerated(EnumType.STRING)
    @Column(name = "veteran_status", length = 50)
    private VeteranStatus veteranStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "disability", length = 50)
    private Disability disability;

    /* ---------- Audit Fields ---------- */
    @CreationTimestamp
    @Column(updatable = false, nullable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private OffsetDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", foreignKey = @ForeignKey(name = "fk_ats_applicant_created_by"))
    private Employee createdBy;

    /* ---------- Applicant Documents ---------- */
    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("applicant-documents")
    @Builder.Default
    private List<AtsApplicantDocument> documents = new ArrayList<>();

    /* ---------- Applicant Education History ---------- */
    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("applicant-educations")
    @Builder.Default
    private List<AtsApplicantEducation> educations = new ArrayList<>();

    /* ---------- Applicant Certifications ---------- */
    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("applicant-certifications")
    @Builder.Default
    private List<AtsApplicantCertification> certifications = new ArrayList<>();

    /* ---------- Applicant Languages ---------- */
    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("applicant-languages")
    @Builder.Default
    private List<AtsApplicantLanguage> languages = new ArrayList<>();

    /* ---------- Applicant Work Experiences ---------- */
    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("applicant-work-experiences")
    @Builder.Default
    private List<AtsApplicantWorkExperience> workExperiences = new ArrayList<>();

    /* ---------- Applicant Employers ---------- */
    @OneToMany(mappedBy = "applicant", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("applicant-employers")
    @Builder.Default
    private List<AtsApplicantEmployer> employers = new ArrayList<>();
}
