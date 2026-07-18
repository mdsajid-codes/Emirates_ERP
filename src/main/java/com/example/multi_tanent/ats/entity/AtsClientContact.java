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
@Table(name = "ats_client_contacts", indexes = {
        @Index(name = "idx_ats_client_contact_tenant", columnList = "tenant_id"),
        @Index(name = "idx_ats_client_contact_client", columnList = "client_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"tenant", "client", "country", "state", "primaryOwner"})
@EqualsAndHashCode(exclude = {"tenant", "client", "country", "state", "primaryOwner"})
public class AtsClientContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_contact_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_contact_client"))
    @JsonBackReference("client-contacts")
    private AtsClient client;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "designation", length = 150)
    private String designation;

    @Column(name = "office_number", length = 30)
    private String officeNumber;

    @Column(name = "office_extension", length = 10)
    private String officeExtension;

    @Column(name = "mobile_number", length = 30)
    private String mobileNumber;

    @Column(name = "email_id", nullable = false, length = 150)
    private String emailId;

    @Column(name = "secondary_email_id", length = 150)
    private String secondaryEmailId;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_owner_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_contact_owner"))
    private Employee primaryOwner;

    @Column(name = "ownership", length = 100)
    private String ownership;

    @Column(name = "allow_access_to_all_users")
    @Builder.Default
    private Boolean allowAccessToAllUsers = false;

    @Column(name = "address_1", length = 250)
    private String address1;

    @Column(name = "address_2", length = 250)
    private String address2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", foreignKey = @ForeignKey(name = "fk_ats_client_contact_country"))
    private AtsCountry country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_ats_client_contact_state"))
    private AtsState state;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "linkedin_profile_url", length = 500)
    private String linkedinProfileUrl;

    @Column(name = "facebook_profile_url", length = 500)
    private String facebookProfileUrl;

    @Column(name = "twitter_profile_url", length = 500)
    private String twitterProfileUrl;

    @Column(name = "google_plus_profile_url", length = 500)
    private String googlePlusProfileUrl;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "client_group", length = 100)
    private String clientGroup;

    @Column(name = "about_the_contact", length = 2000)
    private String aboutTheContact;

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
