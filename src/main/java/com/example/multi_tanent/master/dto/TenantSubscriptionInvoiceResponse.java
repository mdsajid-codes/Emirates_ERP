package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.entity.PaymentStatus;
import com.example.multi_tanent.master.entity.TenantSubscriptionInvoice;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class TenantSubscriptionInvoiceResponse {
    private Long id;
    private Long masterTenantId;
    private String masterTenantName;
    private String invoiceNumber;
    private LocalDateTime generatedDate;
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

    public static TenantSubscriptionInvoiceResponse fromEntity(TenantSubscriptionInvoice entity) {
        return TenantSubscriptionInvoiceResponse.builder()
                .id(entity.getId())
                .masterTenantId(entity.getMasterTenant().getId())
                .masterTenantName(entity.getMasterTenant().getCompanyName())
                .invoiceNumber(entity.getInvoiceNumber())
                .generatedDate(entity.getGeneratedDate())
                .subscriptionStartDate(entity.getSubscriptionStartDate())
                .subscriptionEndDate(entity.getSubscriptionEndDate())
                .totalAmount(entity.getTotalAmount())
                .basicAmount(entity.getBasicAmount())
                .tax(entity.getTax())
                .discount(entity.getDiscount())
                .otherCharges(entity.getOtherCharges())
                .advanceAmount(entity.getAdvanceAmount())
                .pendingAmount(entity.getPendingAmount())
                .paymentStatus(entity.getPaymentStatus())
                .currency(entity.getCurrency())
                .build();
    }
}
