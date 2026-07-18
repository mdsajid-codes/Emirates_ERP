package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.QuotationType;
import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class RentalQuotationRequest {
    private LocalDate quotationDate;
    private Long customerId;
    private Long salespersonId;
    private String reference;
    private LocalDate expiryDate;
    private String deliveryLead;
    private String validity;
    private String paymentTerms;
    private String priceBasis;
    private String dearSir;
    private QuotationType quotationType; // Keeping for consistency, though UI might imply specific rental type
    private List<RentalQuotationItemRequest> items;
    private Integer rentalDurationDays;
    private java.math.BigDecimal subTotalPerDay;
    private java.math.BigDecimal totalRentalPrice;
    private java.math.BigDecimal totalDiscount;
    private java.math.BigDecimal otherCharges;
    private String termsAndConditions;
    private String notes;
    private String manufacture;
    private String remarks;
    private String emailTo;
    private SalesStatus status;
    private String template;
}
