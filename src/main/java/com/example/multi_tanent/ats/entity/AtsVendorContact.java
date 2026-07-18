package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_vendor_contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "vendor")
@EqualsAndHashCode(exclude = "vendor")
public class AtsVendorContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_contact_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_contact_vendor"))
    @JsonBackReference("vendor-contacts")
    private AtsVendor vendor;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "salutation", length = 20)
    private String salutation;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "title", length = 150)
    private String title;

    @Column(name = "designation", length = 150)
    private String designation; 

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "phone", length = 30)
    private String phone;

    @Column(name = "phone_extension", length = 10)
    private String phoneExtension;

    @Column(name = "mobile", length = 30)
    private String mobile;

    @Column(name = "address_1", length = 250)
    private String address1;

    @Column(name = "address_2", length = 250)
    private String address2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_contact_country"))
    private AtsCountry country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_contact_state"))
    private AtsState state;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "linkedin_url", length = 500)
    private String linkedinUrl;

    @Column(name = "facebook_url", length = 500)
    private String facebookUrl;

    @Column(name = "twitter_url", length = 500)
    private String twitterUrl;

    @Column(name = "google_plus_url", length = 500)
    private String googlePlusUrl;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "technologies", length = 1000)
    private String technologies;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_contact_owner"))
    private com.example.multi_tanent.spersusers.enitity.Employee owner;

    @Column(name = "allow_access_to_all_users")
    @Builder.Default
    private Boolean allowAccessToAllUsers = false;

    @Column(name = "comment", length = 2000)
    private String comment;

    @Column(name = "send_requirement")
    @Builder.Default
    private Boolean sendRequirement = false;

    @Column(name = "send_hotlist")
    @Builder.Default
    private Boolean sendHotlist = false;

    @Column(name = "vendor_contact_type", length = 100)
    private String vendorContactType;

    @Column(name = "vendor_group", length = 100)
    private String vendorGroup;

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
