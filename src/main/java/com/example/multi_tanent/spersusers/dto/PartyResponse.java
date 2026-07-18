package com.example.multi_tanent.spersusers.dto;

import com.example.multi_tanent.spersusers.base.PartyBase;

import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class PartyResponse {

    private Long id;
    private PartyBase.PartyType partyType;
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
    private PartyBase.Address billingAddress;
    private PartyBase.Address shippingAddress;
    private Boolean shippingSameAsBilling;
    private String remarks;
    private String createdBy;
    private LocalDateTime createdDate;
    private String primaryContactPersonFull;
    private Boolean active;

    private List<OtherPersonResponse> otherPersons;
    private List<CustomFieldResponse> customFields;
    private List<BaseBankDetailsResponse> bankDetails;

    public static PartyResponse fromEntity(BaseCustomer entity) {
        return PartyResponse.builder()
                .id(entity.getId())
                .partyType(entity.getPartyType())
                .under(entity.getUnder())
                .priceCategory(entity.getPriceCategory())
                .vendorCustomerCode(entity.getVendorCustomerCode())
                .customerCode(entity.getCustomerCode())
                .primaryContactTitle(entity.getPrimaryContactTitle())
                .primaryFirstName(entity.getPrimaryFirstName())
                .primaryLastName(entity.getPrimaryLastName())
                .primaryContactPerson(entity.getPrimaryContactPerson())
                .mobile(entity.getMobile())
                .contactEmail(entity.getContactEmail())
                .contactPhone(entity.getContactPhone())
                .workPhone(entity.getWorkPhone())
                .skypeNameOrNumber(entity.getSkypeNameOrNumber())
                .designation(entity.getDesignation())
                .department(entity.getDepartment())
                .companyName(entity.getCompanyName())
                .website(entity.getWebsite())
                .ownerCeoName(entity.getOwnerCeoName())
                .ownerCeoContact(entity.getOwnerCeoContact())
                .ownerCeoEmail(entity.getOwnerCeoEmail())
                .panNumber(entity.getPanNumber())
                .tanNumber(entity.getTanNumber())
                .cinNo(entity.getCinNo())
                .vatNumber(entity.getVatNumber())
                .vatTreatment(entity.getVatTreatment())
                .vatTrnNumber(entity.getVatTrnNumber())
                .city(entity.getCity())
                .region(entity.getRegion())
                .currency(entity.getCurrency())
                .termsAndConditionsInternal(entity.getTermsAndConditionsInternal())
                .termsAndConditionsDisplay(entity.getTermsAndConditionsDisplay())
                .modeOfPayment(entity.getModeOfPayment())
                .deliveryType(entity.getDeliveryType())
                .paymentTerms(entity.getPaymentTerms())
                .transportDispatchThrough(entity.getTransportDispatchThrough())
                .freightTerms(entity.getFreightTerms())
                .splInstruction(entity.getSplInstruction())
                .salesValuePreviousYear(entity.getSalesValuePreviousYear())
                .facebook(entity.getFacebook())
                .twitter(entity.getTwitter())
                .taxDeducted(entity.getTaxDeducted())
                .openingBalance(entity.getOpeningBalance())
                .openingBalanceType(entity.getOpeningBalanceType())
                .creditLimitAllowed(entity.getCreditLimitAllowed())
                .creditPeriodAllowed(entity.getCreditPeriodAllowed())
                .billingAddress(entity.getBillingAddress())
                .shippingAddress(entity.getShippingAddress())
                .shippingSameAsBilling(entity.getShippingSameAsBilling())
                .remarks(entity.getRemarks())
                .createdBy(entity.getCreatedBy())
                .createdDate(entity.getCreatedDate())
                .primaryContactPersonFull(entity.getPrimaryContactPersonFull())
                .active(entity.getActive())
                .otherPersons(entity.getOtherPersons().stream().map(OtherPersonResponse::fromEntity)
                        .collect(Collectors.toList()))
                .customFields(entity.getCustomFields().stream().map(CustomFieldResponse::fromEntity)
                        .collect(Collectors.toList()))
                .bankDetails(entity.getBankDetails().stream().map(BaseBankDetailsResponse::fromEntity)
                        .collect(Collectors.toList()))
                .build();
    }
}