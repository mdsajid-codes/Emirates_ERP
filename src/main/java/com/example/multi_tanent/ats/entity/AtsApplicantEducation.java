package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_applicant_educations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "applicant")
@EqualsAndHashCode(exclude = "applicant")
public class AtsApplicantEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_applicant_edu_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_applicant_edu_applicant"))
    @JsonBackReference("applicant-educations")
    private AtsApplicant applicant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "degree_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_applicant_edu_degree"))
    private AtsDegree degree;

    @Column(name = "school_name", nullable = false, length = 255)
    private String schoolName;

    @Column(name = "year_completed")
    private Integer yearCompleted;

    @Column(name = "major_study", length = 255)
    private String majorStudy;

    @Column(name = "minor_study", length = 255)
    private String minorStudy;

    @Column(name = "gpa", precision = 4, scale = 2)
    private BigDecimal gpa;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", foreignKey = @ForeignKey(name = "fk_ats_applicant_edu_country"))
    private AtsCountry country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_ats_applicant_edu_state"))
    private AtsState state;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "higher_education", nullable = false)
    @Builder.Default
    private Boolean higherEducation = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
