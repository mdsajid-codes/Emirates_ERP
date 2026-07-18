package com.example.multi_tanent.accounts.dto.payment;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccBankAccountRequest {
    private Long bankId;
    private String accountNumber;
    private String accountName;
    private Long currencyId;
    private Long glAccountId;
    private BigDecimal openingBalance;
    private LocalDate openingDate;
}
