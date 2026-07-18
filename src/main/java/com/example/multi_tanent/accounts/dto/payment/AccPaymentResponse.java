package com.example.multi_tanent.accounts.dto.payment;

import com.example.multi_tanent.accounts.entity.enums.PaymentMethod;
import com.example.multi_tanent.accounts.entity.enums.PaymentStatus;
import com.example.multi_tanent.accounts.entity.enums.PaymentType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class AccPaymentResponse {
    private Long id;
    private String paymentNumber;
    private LocalDate paymentDate;
    private PaymentType paymentType;
    private PaymentMethod paymentMethod;
    private Long partnerId;
    private String partnerType;
    private BigDecimal amount;
    private Long currencyId;
    private Long bankAccountId;
    private String reference;
    private PaymentStatus status;
    private Long journalEntryId;
    private Long pdcId;
    private String notes;
    private String tenantId;
    
    private List<AccPaymentAllocationResponse> allocations;

    @Data
    public static class AccPaymentAllocationResponse {
        private Long id;
        private Long invoiceId;
        private BigDecimal allocatedAmount;
    }
}
