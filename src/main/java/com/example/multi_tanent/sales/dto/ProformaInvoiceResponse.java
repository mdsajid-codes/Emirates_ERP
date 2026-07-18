package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProformaInvoiceResponse {
    private Long id;
    private String invoiceLedger;
    private LocalDate invoiceDate;

    // Flattened or nested customer basics
    private Long customerId;
    private String customerName;

    private String invoiceNumber;
    private String reference;
    private LocalDate dueDate;
    private LocalDate dateOfSupply;

    // Salesperson
    private Long salespersonId;
    private String salespersonName;

    private String poNumber;

    private List<ProformaInvoiceItemResponse> items;

    private BigDecimal subTotal;
    private BigDecimal totalDiscount;
    private BigDecimal grossTotal;
    private BigDecimal totalTax;
    private BigDecimal otherCharges;
    private BigDecimal netTotal;

    private List<String> attachments;

    private String termsAndConditions;
    private String notes;
    private String bankDetails;
    private String template;
    private String emailTo;
    private SalesStatus status;

    private String createdBy;
    private String updatedBy;
}
