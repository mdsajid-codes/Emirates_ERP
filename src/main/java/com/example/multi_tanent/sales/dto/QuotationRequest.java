package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.QuotationType;
import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class QuotationRequest {
    private LocalDate quotationDate;
    private Long customerId;
    private Long salespersonId;
    private String reference;
    private LocalDate expiryDate;
    private QuotationType quotationType;
    private List<QuotationItemRequest> items;
    private String termsAndConditions;
    private String notes;
    private String emailTo;
    private SalesStatus status;
    private String template;
    private java.math.BigDecimal totalDiscount;
    private java.math.BigDecimal otherCharges;
}
