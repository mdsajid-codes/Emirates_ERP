package com.example.multi_tanent.master.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "my_company_info")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MyCompanyInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "logo_url")
    private String logoUrl; // URL or path to the company logo

    // Invoice & Document Images
    @Column(name = "signature_url")
    private String signatureUrl; // Authorized signatory signature

    @Column(name = "stamp_url")
    private String stampUrl; // Company Stamp (Mohar)

    @Column(name = "invoice_header_url")
    private String invoiceHeaderUrl; // Full width header image for invoices

    @Column(name = "invoice_footer_url")
    private String invoiceFooterUrl; // Full width footer image for invoices

    @Column(name = "watermark_url")
    private String watermarkUrl; // Background watermark image

    // Address fields
    private String address;
    private String city;
    private String emirate; // UAE specific

    @Column(name = "po_box")
    private String poBox;

    private String country;
    private String phone;
    private String email;
    private String website;

    // --- UAE-Specific Statutory Details ---

    @Column(name = "trade_license_number")
    private String tradeLicenseNumber;

    @Column(name = "trade_license_expiry")
    private LocalDate tradeLicenseExpiry;

    @Column(name = "trn")
    private String trn; // Tax Registration Number for VAT

    @Column(name = "mohre_establishment_id")
    private String mohreEstablishmentId; // Ministry of Human Resources & Emiratisation ID

    @Column(name = "visa_quota_total")
    private Integer visaQuotaTotal;

    @Column(name = "employer_bank_routing_code")
    private String employerBankRoutingCode; // Agent ID (Bank routing code for WPS)

    @OneToMany(mappedBy = "myCompanyInfo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MyBankDetails> bankAccounts;

    @OneToMany(mappedBy = "myCompanyInfo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MyCustomField> customFields;
}
