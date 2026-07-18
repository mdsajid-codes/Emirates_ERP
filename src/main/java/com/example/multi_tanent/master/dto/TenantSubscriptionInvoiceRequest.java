package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.PaymentStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TenantSubscriptionInvoiceRequest {
    private String invoiceNumber;
    private LocalDate subscriptionStartDate;
    private LocalDate subscriptionEndDate;
    private BigDecimal totalAmount;
    private BigDecimal basicAmount;
    private BigDecimal tax;
    private BigDecimal discount;
    private BigDecimal otherCharges;
    private BigDecimal advanceAmount;
    private BigDecimal pendingAmount;
    private PaymentStatus paymentStatus;
    private String currency;
}
