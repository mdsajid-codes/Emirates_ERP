package com.example.multi_tanent.accounts.dto.vat;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class VatSettlementRequest {
    private Long bankAccountId;
    private BigDecimal amount;
}
