package com.example.multi_tanent.spersusers.dto;

import com.example.multi_tanent.spersusers.base.PartyBase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PartyRequest {
    
    @NotNull(message = "Party type is required")
    private PartyBase.PartyType partyType;

    // PartyBase fields
    private String under;
    private String priceCategory;
    private String vendorCustomerCode;
    private String customerCode;
    private String primaryContactTitle;
    private String primaryFirstName;
    private String primaryLastName;
    private String primaryContactPerson;
    private String mobile;
    private String contactEmail;
    private String contactPhone;
    private String workPhone;
    private String skypeNameOrNumber;
    private String designation;
    private String department;

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String website;
    private String ownerCeoName;
    private String ownerCeoContact;
    private String ownerCeoEmail;
    private String panNumber;
    private String tanNumber;
    private String cinNo;

    private String vatNumber;
    private PartyBase.VatTreatment vatTreatment;
    private String vatTrnNumber;
    
    private String city;
    private String region;
    private String currency;

    private String termsAndConditionsInternal;
    private String termsAndConditionsDisplay;
    private String modeOfPayment;
    private String deliveryType;
    private String paymentTerms;
    private String transportDispatchThrough;
    private String freightTerms;
    private String splInstruction;
    private BigDecimal salesValuePreviousYear;

    private String facebook;
    private String twitter;

    private Boolean taxDeducted;
    private BigDecimal openingBalance;
    private PartyBase.BalanceType openingBalanceType;

    private BigDecimal creditLimitAllowed;
    private Integer creditPeriodAllowed;

    @Valid
    private AddressRequest billingAddress;

    @Valid
    private AddressRequest shippingAddress;

    private Boolean shippingSameAsBilling;
    private String remarks;

    // BaseCustomer specific fields
    private String primaryContactPersonFull;
    private Boolean active;

    @Valid
    private List<OtherPersonRequest> otherPersons;

    @Valid
    private List<CustomFieldRequest> customFields;

    @Valid
    private List<BaseBankDetailsRequest> bankDetails;

    // Nested DTO for Address
    @Data
    public static class AddressRequest {
        private String attention;
        private String addressLine;
        private String city;
        private String state;
        private String zipCode;
        private String country;
        private String phone;
        private String fax;
    }
}