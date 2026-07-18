package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ats_clients", indexes = {
        @Index(name = "idx_ats_client_tenant_status", columnList = "tenant_id,status"),
        @Index(name = "idx_ats_client_tenant_name", columnList = "tenant_id,client_name"),
        @Index(name = "idx_ats_client_tenant_created", columnList = "tenant_id,created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"tenant", "primaryBusinessUnit", "businessUnits", "parentClient", "childClients", "country", "state", "primaryOwner", "clientLead", "requiredDocuments", "paymentTerms", "guidelines", "contacts", "assignment", "submissionFormat", "tasks"})
@EqualsAndHashCode(exclude = {"tenant", "primaryBusinessUnit", "businessUnits", "parentClient", "childClients", "country", "state", "primaryOwner", "clientLead", "requiredDocuments", "paymentTerms", "guidelines", "contacts", "assignment", "submissionFormat", "tasks"})
public class AtsClient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_tenant"))
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_business_unit_id", foreignKey = @ForeignKey(name = "fk_ats_client_primary_bu"))
    private AtsBusinessUnit primaryBusinessUnit;

    @Column(name = "client_visibility", length = 50)
    private String clientVisibility;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "ats_client_business_units",
        joinColumns = @JoinColumn(name = "client_id"),
        inverseJoinColumns = @JoinColumn(name = "business_unit_id"),
        foreignKey = @ForeignKey(name = "fk_ats_cbu_client"),
        inverseForeignKey = @ForeignKey(name = "fk_ats_cbu_bu")
    )
    @Builder.Default
    private List<AtsBusinessUnit> businessUnits = new ArrayList<>();

    @Column(name = "client_name", nullable = false, length = 200)
    private String clientName;

    @Column(name = "client_facilities", length = 500)
    private String clientFacilities;

    @Column(name = "vms_client_name", length = 200)
    private String vmsClientName;

    @Column(name = "federal_id", length = 100)
    private String federalId;

    @Column(name = "contact_number", length = 50)
    private String contactNumber;

    @Column(name = "email_id", length = 150)
    private String emailId;

    @Column(name = "address", length = 500)
    private String address;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_client_id", foreignKey = @ForeignKey(name = "fk_ats_client_parent"))
    @JsonBackReference("client-parent")
    private AtsClient parentClient;

    @OneToMany(mappedBy = "parentClient", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("client-parent")
    @Builder.Default
    private List<AtsClient> childClients = new ArrayList<>();

    @Column(name = "notify_user_near_location")
    @Builder.Default
    private Boolean notifyUserNearLocation = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", foreignKey = @ForeignKey(name = "fk_ats_client_country"))
    private AtsCountry country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_ats_client_state"))
    private AtsState state;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "website", nullable = false, length = 255)
    private String website;

    @Column(name = "send_requirement")
    @Builder.Default
    private Boolean sendRequirement = false;

    @Column(name = "send_hotlist")
    @Builder.Default
    private Boolean sendHotlist = false;

    @Column(name = "fax", length = 50)
    private String fax;

    @Column(name = "industry", length = 100)
    private String industry;

    @Column(name = "status", nullable = false, length = 50)
    private String status;

    @Column(name = "category", length = 100)
    private String category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_owner_id", foreignKey = @ForeignKey(name = "fk_ats_client_primary_owner"))
    private Employee primaryOwner;

    @Column(name = "ownership", length = 100)
    private String ownership;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_lead_id", foreignKey = @ForeignKey(name = "fk_ats_client_client_lead"))
    private Employee clientLead;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "ats_client_required_documents",
        joinColumns = @JoinColumn(name = "client_id"),
        inverseJoinColumns = @JoinColumn(name = "document_type_id"),
        foreignKey = @ForeignKey(name = "fk_ats_crd_client"),
        inverseForeignKey = @ForeignKey(name = "fk_ats_crd_doc_type")
    )
    @Builder.Default
    private List<AtsDocumentType> requiredDocuments = new ArrayList<>();

    @Column(name = "allow_access_to_all_users")
    @Builder.Default
    private Boolean allowAccessToAllUsers = false;

    @Column(name = "display_on_job")
    @Builder.Default
    private Boolean displayOnJob = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_terms_id", foreignKey = @ForeignKey(name = "fk_ats_client_payment_terms"))
    private AtsPaymentTerms paymentTerms;

    @Column(name = "practice", length = 100)
    private String practice;

    @Column(name = "about_company", length = 4000)
    private String aboutCompany;

    @Column(name = "stop_submit_email_notification")
    @Builder.Default
    private Boolean stopSubmitEmailNotification = false;

    @Column(name = "default_address_for_jobs")
    @Builder.Default
    private Boolean defaultAddressForJobs = false;

    @Column(name = "client_short_name", length = 100)
    private String clientShortName;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("client-accounts")
    @Builder.Default
    private List<AtsClientAccount> accounts = new ArrayList<>();

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("client-notes")
    @Builder.Default
    private List<AtsClientNote> notes = new ArrayList<>();

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("client-documents")
    @Builder.Default
    private List<AtsClientDocument> documents = new ArrayList<>();

    @OneToOne(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("client-guidelines")
    private AtsClientGuideline guidelines;

    @OneToOne(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("client-assignments")
    private AtsClientAssignment assignment;

    @OneToOne(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("client-submission-format")
    private AtsClientSubmissionFormat submissionFormat;

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("client-contacts")
    @Builder.Default
    private List<AtsClientContact> contacts = new ArrayList<>();

    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("client-tasks")
    @Builder.Default
    private List<AtsClientTask> tasks = new ArrayList<>();

    @Column(name = "is_blacklisted")
    @Builder.Default
    private Boolean isBlacklisted = false;

    @Column(name = "blacklist_reason", length = 1000)
    private String blacklistReason;

    @Column(name = "blacklisted_by", length = 150)
    private String blacklistedBy;

    @Column(name = "blacklisted_date")
    private OffsetDateTime blacklistedDate;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
