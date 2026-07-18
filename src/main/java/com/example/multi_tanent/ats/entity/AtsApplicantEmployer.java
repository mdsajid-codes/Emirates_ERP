package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_applicant_employers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"applicant", "vendor"})
@EqualsAndHashCode(exclude = {"applicant", "vendor"})
public class AtsApplicantEmployer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_applicant_employer_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "applicant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_applicant_employer_applicant"))
    @JsonBackReference("applicant-employers")
    private AtsApplicant applicant;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode", nullable = false, length = 20)
    private EmployerMode mode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", foreignKey = @ForeignKey(name = "fk_ats_applicant_employer_vendor"))
    private AtsVendor vendor;

    @Column(name = "first_name", nullable = false, length = 255)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 255)
    private String lastName;

    @Column(name = "employer_name", length = 255)
    private String employerName;

    @Column(name = "office_number", length = 50)
    private String officeNumber;

    @Column(name = "office_extension", length = 20)
    private String officeExtension;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "mobile_number", length = 50)
    private String mobileNumber;

    @Column(name = "status", length = 100)
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    public enum EmployerMode {
        NEW,
        EXISTING
    }
}
