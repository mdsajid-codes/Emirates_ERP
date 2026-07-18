package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.QuotationType;
import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class RentalQuotationResponse {
    private Long id;
    private LocalDate quotationDate;
    private Long customerId;
    private String customerName;
    private Long salespersonId;
    private String salespersonName;
    private String quotationNumber;
    private String reference;
    private LocalDate expiryDate;
    private String deliveryLead;
    private String validity;
    private String paymentTerms;
    private String priceBasis;
    private String dearSir;
    private QuotationType quotationType;
    private List<RentalQuotationItemResponse> items;
    private Integer rentalDurationDays;
    private BigDecimal subTotalPerDay;
    private BigDecimal totalRentalPrice;
    private BigDecimal totalDiscount; // Total discount
    private BigDecimal grossTotal;
    private BigDecimal totalTax;
    private BigDecimal otherCharges;
    private BigDecimal netTotal;
    private String termsAndConditions;
    private String notes;
    private String manufacture;
    private String remarks;
    private List<String> attachments;
    private String emailTo;
    private SalesStatus status;
    private String template;
    private String createdBy;
    private String updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
