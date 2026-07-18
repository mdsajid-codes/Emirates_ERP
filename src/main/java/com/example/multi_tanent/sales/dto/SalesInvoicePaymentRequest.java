package com.example.multi_tanent.sales.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class SalesInvoicePaymentRequest {
    /** Amount the customer is paying now (can be partial) */
    private BigDecimal amountPaid;

    /** Payment date */
    private LocalDate paymentDate;

    /** BANK or CASH */
    private String paymentMethod; // "BANK" or "CASH"

    /** Optional cheque/reference number */
    private String referenceNumber;

    /** Optional notes */
    private String notes;
}
