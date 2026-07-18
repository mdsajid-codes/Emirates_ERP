package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.QuotationType;
import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class QuotationResponse {
    private Long id;
    private LocalDate quotationDate;
    private Long customerId;
    private String customerName; // Added for convenience
    private Long salespersonId;
    private String salespersonName;
    private String quotationNumber;
    private String reference;
    private LocalDate expiryDate;
    private QuotationType quotationType;
    private List<QuotationItemResponse> items;
    private BigDecimal subTotal;
    private BigDecimal totalDiscount;
    private BigDecimal grossTotal;
    private BigDecimal totalTax;
    private BigDecimal otherCharges;
    private BigDecimal netTotal;
    private String termsAndConditions;
    private String notes;
    private List<String> attachments;
    private String emailTo;
    private SalesStatus status;
    private String template;
    private String createdBy;
    private String updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
