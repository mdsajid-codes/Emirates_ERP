package com.example.multi_tanent.master.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "tenant_company_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class TenantCompanyInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "master_tenant_id", referencedColumnName = "id", nullable = false)
    @JsonIgnore
    private MasterTenant masterTenant;

    @Column(nullable = false, name = "company_name")
    private String companyName;

    @Column(name = "logo_url")
    private String logoUrl;

    // Address & Contact
    private String address;
    private String city;
    private String state;
    private String country;
    private String zipCode;
    private String phone;
    private String email;
    private String website;

    // Statutory / Legal Details
    @Column(name = "tax_id")
    private String taxId; // Can overlap with TRN but keeping generic

    @Column(name = "registration_number")
    private String registrationNumber; // Can overlap with Trade License

    // UAE Specifics
    private String emirate;
    private String poBox;

    @Column(name = "trade_license_number")
    private String tradeLicenseNumber;

    @Column(name = "trade_license_expiry")
    private LocalDate tradeLicenseExpiry;

    @Column(name = "trn")
    private String trn; // Tax Registration Number

    @Column(name = "mohre_establishment_id")
    private String mohreEstablishmentId;

    @Column(name = "visa_quota_total")
    private Integer visaQuotaTotal;

    @Column(name = "employer_bank_routing_code")
    private String employerBankRoutingCode;
}
