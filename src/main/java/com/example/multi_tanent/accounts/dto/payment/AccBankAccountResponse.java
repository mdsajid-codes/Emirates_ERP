package com.example.multi_tanent.accounts.dto.payment;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccBankAccountResponse {
    private Long id;
    private Long bankId;
    private String bankName;
    private String accountNumber;
    private String accountName;
    private Long currencyId;
    private Long glAccountId;
    private String glAccountCode;
    private String glAccountDescription;
    private BigDecimal openingBalance;
    private LocalDate openingDate;
    private Boolean isActive;
}
