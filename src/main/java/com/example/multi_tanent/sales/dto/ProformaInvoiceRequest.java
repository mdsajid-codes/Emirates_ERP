package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class ProformaInvoiceRequest {
    private String invoiceLedger;
    private LocalDate invoiceDate;
    private Long customerId;
    private String reference;
    private LocalDate dueDate;
    private LocalDate dateOfSupply;
    private Long salespersonId;
    private String poNumber;

    private List<ProformaInvoiceItemRequest> items;

    // Totals - typically calculated on BE, but accepting overrides if needed
    private BigDecimal subTotal;
    private BigDecimal totalDiscount;
    private BigDecimal grossTotal;
    private BigDecimal totalTax;
    private BigDecimal otherCharges;
    private BigDecimal netTotal; // Often calculated

    private String termsAndConditions;
    private String notes;
    private String bankDetails;
    private String template;
    private String emailTo;
    private SalesStatus status;
}
