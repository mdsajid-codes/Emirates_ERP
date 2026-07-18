package com.example.multi_tanent.accounts.dto.payment;

import com.example.multi_tanent.accounts.entity.enums.PaymentMethod;
import com.example.multi_tanent.accounts.entity.enums.PaymentType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class AccPaymentRequest {
    private LocalDate paymentDate;
    private PaymentType paymentType;
    private PaymentMethod paymentMethod;
    private Long partnerId;
    private String partnerType; // CUSTOMER or SUPPLIER
    private BigDecimal amount;
    private Long currencyId;
    private Long bankAccountId;
    private String reference;
    private String notes;
    private String chequeNumber;
    private LocalDate chequeDate;
    private List<AccPaymentAllocationRequest> allocations;
}
