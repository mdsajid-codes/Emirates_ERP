package com.example.multi_tanent.spersusers.base;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class PartyBase {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column (name = "party_type", length = 64)
    private PartyType partyType;

    /* Basic / header */
    @Column(name = "under_account")
    private String under; // e.g., "Trade receivables"

    @Column(name = "price_category")
    private String priceCategory;

    @Column(name = "vendor_customer_code", length = 64)
    private String vendorCustomerCode; // UI showed codes like P00102

    @Column(name = "customer_code", length = 64)
    private String customerCode; // auto generated in UI

    /* Primary contact / person */
    @Column(name = "primary_contact_title", length = 32)
    private String primaryContactTitle; // Mr./Ms. etc.

    @Column(name = "primary_first_name", length = 128)
    private String primaryFirstName;

    @Column(name = "primary_last_name", length = 128)
    private String primaryLastName;

    @Column(name = "primary_contact_person", length = 255)
    private String primaryContactPerson; // primary contact full

    @Column(name = "primary_mobile", length = 50)
    private String mobile;

    @Column(name = "contact_email", length = 256)
    private String contactEmail;

    @Column(name = "contact_phone", length = 64)
    private String contactPhone;

    @Column(name = "work_phone", length = 64)
    private String workPhone;

    @Column(name = "skype", length = 128)
    private String skypeNameOrNumber;

    @Column(name = "designation", length = 128)
    private String designation;

    @Column(name = "department", length = 128)
    private String department;

    /* Company / corporate details */
    @NotBlank
    @Column(name = "company_name", nullable = false, length = 512)
    private String companyName;

    @Column(name = "website", length = 256)
    private String website;

    @Column(name = "owner_ceo_name", length = 256)
    private String ownerCeoName;

    @Column(name = "owner_ceo_contact", length = 64)
    private String ownerCeoContact;

    @Column(name = "owner_ceo_email", length = 256)
    private String ownerCeoEmail;

    @Column(name = "pan_number", length = 64)
    private String panNumber;

    @Column(name = "tan_number", length = 64)
    private String tanNumber;

    @Column(name = "cin_number", length = 64)
    private String cinNo;

    /* VAT / Tax */
    @Column(name = "vat_number", length = 128)
    private String vatNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "vat_treatment", length = 64)
    private VatTreatment vatTreatment;

    @Column(name = "vat_trn_number", length = 128)
    private String vatTrnNumber;

    /* Location / region / currency */
    @Column(name = "city", length = 128)
    private String city;

    @Column(name = "region", length = 128)
    private String region;

    @Column(name = "currency", length = 64)
    private String currency;

    /* Terms & other misc company fields */
    @Lob
    @Column(name = "terms_internal")
    private String termsAndConditionsInternal;

    @Lob
    @Column(name = "terms_display")
    private String termsAndConditionsDisplay;

    @Column(name = "mode_of_payment", length = 256)
    private String modeOfPayment;

    @Column(name = "delivery_type", length = 256)
    private String deliveryType;

    @Column(name = "payment_terms", length = 512)
    private String paymentTerms;

    @Column(name = "transport_dispatch_through", length = 512)
    private String transportDispatchThrough;

    @Column(name = "freight_terms", length = 512)
    private String freightTerms;

    @Column(name = "spl_instruction", length = 1024)
    private String splInstruction;

    @Column(name = "sales_value_previous_year", precision = 19, scale = 4)
    private BigDecimal salesValuePreviousYear;

    @Column(name = "facebook", length = 256)
    private String facebook;

    @Column(name = "twitter", length = 256)
    private String twitter;

    @Column(name = "tax_deducted")
    private Boolean taxDeducted = Boolean.FALSE; // radio No/Yes

    @Column(name = "opening_balance", precision = 19, scale = 4)
    private BigDecimal openingBalance;

    @Enumerated(EnumType.STRING)
    @Column(name = "opening_balance_type", length = 8)
    private BalanceType openingBalanceType; // DR or CR

    /* Credit limit detail */
    @Column(name = "credit_limit_allowed", precision = 19, scale = 4)
    private BigDecimal creditLimitAllowed;

    @Column(name = "credit_period_allowed")
    private Integer creditPeriodAllowed; // in days perhaps

    /* Billing / Shipping are embeddables declared here for reuse */
    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "attention", column = @Column(name = "billing_attention")),
            @AttributeOverride(name = "addressLine", column = @Column(name = "billing_address", length = 2000)),
            @AttributeOverride(name = "city", column = @Column(name = "billing_city")),
            @AttributeOverride(name = "state", column = @Column(name = "billing_state")),
            @AttributeOverride(name = "zipCode", column = @Column(name = "billing_zip_code")),
            @AttributeOverride(name = "country", column = @Column(name = "billing_country")),
            @AttributeOverride(name = "phone", column = @Column(name = "billing_phone")),
            @AttributeOverride(name = "fax", column = @Column(name = "billing_fax"))
    })
    private Address billingAddress;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "attention", column = @Column(name = "shipping_attention")),
            @AttributeOverride(name = "addressLine", column = @Column(name = "shipping_address", length = 2000)),
            @AttributeOverride(name = "city", column = @Column(name = "shipping_city")),
            @AttributeOverride(name = "state", column = @Column(name = "shipping_state")),
            @AttributeOverride(name = "zipCode", column = @Column(name = "shipping_zip_code")),
            @AttributeOverride(name = "country", column = @Column(name = "shipping_country")),
            @AttributeOverride(name = "phone", column = @Column(name = "shipping_phone")),
            @AttributeOverride(name = "fax", column = @Column(name = "shipping_fax"))
    })
    private Address shippingAddress;

    @Column(name = "shipping_same_as_billing")
    private Boolean shippingSameAsBilling = Boolean.FALSE;

    /* Remarks */
    @Lob
    @Column(name = "remarks")
    private String remarks;

    /* Audit / grid fields */
    @Column(name = "created_by", length = 128)
    private String createdBy;

    @Column(name = "created_date")
    private LocalDateTime createdDate;

    /* enums used in base */
    public enum VatTreatment {
        VAT_REGISTERED,
        VAT_UNREGISTERED,
        VAT_EXEMPT,
        OTHER
    }

    public enum BalanceType {
        DR, CR
    }

    /* Embeddable classes */
    @Embeddable
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Address {
        @Column(name = "attention", length = 256)
        private String attention;
        @Lob
        @Column(name = "address_line")
        private String addressLine;
        @Column(name = "city", length = 128)
        private String city;
        @Column(name = "state", length = 128)
        private String state;
        @Column(name = "zip_code", length = 64)
        private String zipCode;
        @Column(name = "country", length = 128)
        private String country;
        @Column(name = "phone", length = 64)
        private String phone;
        @Column(name = "fax", length = 64)
        private String fax;
    }

    public enum PartyType {
        CUSTOMER,
        SUPPLIER
    }
}
