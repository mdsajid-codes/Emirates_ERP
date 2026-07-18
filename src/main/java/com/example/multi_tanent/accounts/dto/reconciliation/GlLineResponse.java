package com.example.multi_tanent.accounts.dto.reconciliation;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class GlLineResponse {
    private Long id;
    private LocalDate date;
    private String description;
    private BigDecimal amount;
    private Boolean isMatched;
}
