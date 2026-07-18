package com.example.multi_tanent.accounts.dto.payment;

import com.example.multi_tanent.accounts.entity.enums.PaymentMethod;
import com.example.multi_tanent.accounts.entity.enums.PaymentStatus;
import com.example.multi_tanent.accounts.entity.enums.PaymentType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentRegisterResponse {
    private Long id;
    private String paymentNumber;
    private LocalDate paymentDate;
    private PaymentType paymentType;
    private PaymentMethod paymentMethod;
    private Long partnerId;
    private String partnerName;
    private BigDecimal amount;
    private Long currencyId;
    private Long bankAccountId;
    private String bankAccountName;
    private String reference;
    private PaymentStatus status;
    private Long journalEntryId;
    private String tenantId;
}
