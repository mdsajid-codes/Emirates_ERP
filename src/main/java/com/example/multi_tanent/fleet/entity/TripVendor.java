package com.example.multi_tanent.fleet.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

@Entity
@Table(name = "trip_vendors",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "company_name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripVendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "contact_person_name")
    private String contactPersonName;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "vendor_type")
    private String vendorType;

    @Column(name = "service_category")
    private String serviceCategory;

    @Column(name = "trn_number")
    private String trnNumber;

    @Column(name = "trade_license_number")
    private String tradeLicenseNumber;

    @Column(name = "designation")
    private String designation;

    @Column(name = "payment_terms_days")
    private Integer paymentTermsDays;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "iban_number")
    private String ibanNumber;

    @Column(name = "billing_address", length = 1000)
    private String billingAddress;

    @Column(name = "emirate")
    private String emirate;

    @Column(name = "country")
    private String country;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "status")
    private String status;

    @Builder.Default
    @Column(name = "active")
    private Boolean active = Boolean.TRUE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
