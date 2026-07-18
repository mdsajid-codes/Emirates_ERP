package com.example.multi_tanent.accounts.dto.investment;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccCashEquivalentRequest {
    private String name;
    private Long bankAccountId;
    private BigDecimal amount;
    private LocalDate investmentDate;
    private LocalDate maturityDate;
    private BigDecimal interestRate;
    private Long glAccountId; // Optional, might use a default CE account
}
