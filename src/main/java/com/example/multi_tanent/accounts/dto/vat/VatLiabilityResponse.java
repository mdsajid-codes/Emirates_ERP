package com.example.multi_tanent.accounts.dto.vat;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class VatLiabilityResponse {
    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal totalOutputVat;
    private BigDecimal totalInputVat;
    private BigDecimal netVatLiability;
}
