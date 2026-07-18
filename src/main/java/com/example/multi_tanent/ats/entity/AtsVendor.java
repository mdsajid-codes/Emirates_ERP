package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.ats.enums.VendorStatus;
import com.example.multi_tanent.ats.enums.VendorType;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ats_vendors", indexes = {
        @Index(name = "idx_ats_vendor_tenant_status", columnList = "tenant_id,vendor_status"),
        @Index(name = "idx_ats_vendor_tenant_email", columnList = "tenant_id,primary_email"),
        @Index(name = "idx_ats_vendor_tenant_created", columnList = "tenant_id,created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_tenant"))
    private Tenant tenant;

    @Column(name = "vendor_code", length = 50)
    private String vendorCode;

    @Column(name = "company_name", nullable = false, length = 200)
    private String companyName;

    @Column(name = "display_name", length = 200)
    private String displayName;

    @Enumerated(EnumType.STRING)
    @Column(name = "vendor_type", length = 50)
    private VendorType vendorType;

    @Enumerated(EnumType.STRING)
    @Column(name = "vendor_status", nullable = false, length = 50)
    @Builder.Default
    private VendorStatus vendorStatus = VendorStatus.ACTIVE;

    @Column(name = "is_blacklisted")
    @Builder.Default
    private Boolean isBlacklisted = false;

    @Column(name = "blacklist_reason", length = 1000)
    private String blacklistReason;

    @Column(name = "blacklisted_by", length = 150)
    private String blacklistedBy;

    @Column(name = "blacklisted_date")
    private OffsetDateTime blacklistedDate;

    @Column(name = "website", length = 500)
    private String website;

    @Column(name = "primary_email", nullable = false, length = 150)
    private String primaryEmail;

    @Column(name = "alternate_email", length = 150)
    private String alternateEmail;

    @Column(name = "primary_phone", length = 30)
    private String primaryPhone;

    @Column(name = "fax_number", length = 30)
    private String faxNumber;

    @Convert(converter = AttributeEncryptor.class)
    @Column(name = "tax_id", length = 255)
    private String taxId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_business_unit_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_primary_bu"))
    private AtsBusinessUnit primaryBusinessUnit;

    @Column(name = "vendor_visibility", length = 50)
    private String vendorVisibility;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "ats_vendor_business_units",
        joinColumns = @JoinColumn(name = "vendor_id"),
        inverseJoinColumns = @JoinColumn(name = "business_unit_id"),
        foreignKey = @ForeignKey(name = "fk_ats_vbu_vendor"),
        inverseForeignKey = @ForeignKey(name = "fk_ats_vbu_bu")
    )
    @Builder.Default
    private List<AtsBusinessUnit> businessUnits = new ArrayList<>();

    @Column(name = "federal_id", length = 100)
    private String federalId;

    @Column(name = "send_requirement")
    @Builder.Default
    private Boolean sendRequirement = false;

    @Column(name = "send_hotlist")
    @Builder.Default
    private Boolean sendHotlist = false;

    @Column(name = "ownership", length = 200)
    private String ownership;

    @Column(name = "allow_access_to_all_users")
    @Builder.Default
    private Boolean allowAccessToAllUsers = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_lead_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_lead"))
    private Employee vendorLead;

    @Column(name = "technologies", length = 1000)
    private String technologies;

    @Column(name = "about_vendor", length = 4000)
    private String aboutVendor;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_state"))
    private AtsState state;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_country"))
    private AtsCountry country;

    @Column(name = "notes", length = 4000)
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_owner"))
    private Employee owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_created_by"))
    private Employee createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("vendor-contacts")
    @Builder.Default
    private List<AtsVendorContact> contacts = new ArrayList<>();

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("vendor-contracts")
    @Builder.Default
    private List<AtsVendorContract> contracts = new ArrayList<>();

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("vendor-notes")
    @Builder.Default
    private List<AtsVendorNote> vendorNotes = new ArrayList<>();

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("vendor-tasks")
    @Builder.Default
    private List<AtsVendorTask> tasks = new ArrayList<>();

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("vendor-documents")
    @Builder.Default
    private List<AtsVendorDocument> documents = new ArrayList<>();

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("vendor-emails")
    @Builder.Default
    private List<AtsVendorEmailActivity> emailActivities = new ArrayList<>();

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("vendor-bank-accounts")
    @Builder.Default
    private List<AtsVendorBankAccount> bankAccounts = new ArrayList<>();

    @OneToOne(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("vendor-account")
    private AtsVendorAccount account;

    @OneToOne(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonManagedReference("vendor-sub-format")
    private AtsVendorSubmissionFormat submissionFormat;
}
