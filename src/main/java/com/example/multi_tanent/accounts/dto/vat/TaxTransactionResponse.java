package com.example.multi_tanent.accounts.dto.vat;

import com.example.multi_tanent.accounts.entity.enums.TaxPaymentType;
import com.example.multi_tanent.accounts.entity.enums.TaxTransactionType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class TaxTransactionResponse {
    private Long id;
    private LocalDate transactionDate;
    private TaxTransactionType transactionType;
    private TaxPaymentType paymentType;
    private BigDecimal amount;
    private String description;
    private Long journalEntryId;
}
