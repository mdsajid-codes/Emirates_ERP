package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class SalesOrderResponse {
    private Long id;
    private LocalDate salesOrderDate;
    private Long customerId;
    private String customerName;
    private String salesOrderNumber;
    private String reference;
    private String customerPoNo;
    private LocalDate customerPoDate;
    private Long salespersonId;
    private String salespersonName;
    private String saleType;
    private List<SalesOrderItemResponse> items;
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
