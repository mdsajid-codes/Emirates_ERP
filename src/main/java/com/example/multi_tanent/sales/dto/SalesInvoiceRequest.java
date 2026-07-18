package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class SalesInvoiceRequest {
    private String invoiceLedger;
    private LocalDate invoiceDate;
    private Long customerId;
    private String reference;
    private String orderNumber;

    private String customerPoNo;
    private LocalDate customerPoDate;
    private String saleType;

    private LocalDate dueDate;
    private LocalDate dateOfSupply;
    private Long salespersonId;

    // New fields
    private Boolean enableGrossNetWeight;
    private String delayReason;
    private BigDecimal amountReceived;
    private BigDecimal balanceDue;

    private List<SalesInvoiceItemRequest> items;

    // Totals
    private BigDecimal subTotal;
    private BigDecimal totalDiscount;
    private BigDecimal grossTotal;
    private BigDecimal totalTax;
    private BigDecimal otherCharges;
    private BigDecimal netTotal;

    private String termsAndConditions;
    private String notes;
    private String template;
    private String emailTo;
    private SalesStatus status;
}
