package com.example.multi_tanent.accounts.dto.payment;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccPaymentAllocationRequest {
    private Long invoiceId;
    private BigDecimal allocatedAmount;
}
