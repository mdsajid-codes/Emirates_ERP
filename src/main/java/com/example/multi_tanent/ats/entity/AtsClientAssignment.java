package com.example.multi_tanent.ats.entity;

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
@Table(name = "ats_client_assignments", indexes = {
        @Index(name = "idx_ats_client_assignment_tenant", columnList = "tenant_id"),
        @Index(name = "idx_ats_client_assignment_client", columnList = "client_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {
        "tenant", "client", "assignedToUsers", "salesManager", "accountManager",
        "recruitmentManager", "secondarySalesManager", "secondaryRecruitmentManager",
        "tatNotificationRecipients"
})
@EqualsAndHashCode(exclude = {
        "tenant", "client", "assignedToUsers", "salesManager", "accountManager",
        "recruitmentManager", "secondarySalesManager", "secondaryRecruitmentManager",
        "tatNotificationRecipients"
})
public class AtsClientAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_assignment_tenant"))
    private Tenant tenant;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_assignment_client"))
    @JsonBackReference("client-assignments")
    private AtsClient client;

    // ─── User Assignments ─────────────────────────────
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "ats_client_assignment_users",
            joinColumns = @JoinColumn(name = "assignment_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id"),
            foreignKey = @ForeignKey(name = "fk_ats_cau_assignment"),
            inverseForeignKey = @ForeignKey(name = "fk_ats_cau_employee")
    )
    @Builder.Default
    private List<Employee> assignedToUsers = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_manager_id", foreignKey = @ForeignKey(name = "fk_ats_ca_sales_mgr"))
    private Employee salesManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_manager_id", foreignKey = @ForeignKey(name = "fk_ats_ca_acct_mgr"))
    private Employee accountManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recruitment_manager_id", foreignKey = @ForeignKey(name = "fk_ats_ca_rec_mgr"))
    private Employee recruitmentManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secondary_sales_manager_id", foreignKey = @ForeignKey(name = "fk_ats_ca_sec_sales_mgr"))
    private Employee secondarySalesManager;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secondary_recruitment_manager_id", foreignKey = @ForeignKey(name = "fk_ats_ca_sec_rec_mgr"))
    private Employee secondaryRecruitmentManager;

    // ─── Turnaround Time (TAT) ────────────────────────
    @Column(name = "default_tat_days")
    private Integer defaultTatDays;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "ats_client_assignment_tat_recipients",
            joinColumns = @JoinColumn(name = "assignment_id"),
            inverseJoinColumns = @JoinColumn(name = "employee_id"),
            foreignKey = @ForeignKey(name = "fk_ats_catr_assignment"),
            inverseForeignKey = @ForeignKey(name = "fk_ats_catr_employee")
    )
    @Builder.Default
    private List<Employee> tatNotificationRecipients = new ArrayList<>();

    // ─── Tax & Pay ────────────────────────────────────
    @Column(name = "default_tax_term", length = 100)
    private String defaultTaxTerm;

    @Column(name = "default_work_authorization", length = 100)
    private String defaultWorkAuthorization;

    @Column(name = "default_pay_rate_tax_term", length = 100)
    private String defaultPayRateTaxTerm;

    @Column(name = "default_bill_rate_tax_term", length = 100)
    private String defaultBillRateTaxTerm;

    // ─── Career Portal ────────────────────────────────
    @Column(name = "post_job_in_career_portal")
    @Builder.Default
    private Boolean postJobInCareerPortal = false;

    // ─── Submission Rules ─────────────────────────────
    @Column(name = "make_references_mandatory")
    @Builder.Default
    private Boolean makeReferencesMandatory = false;

    @Column(name = "max_submissions")
    private Integer maxSubmissions;

    @Column(name = "number_of_positions")
    private Integer numberOfPositions;

    // ─── Metadata ─────────────────────────────────────
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
