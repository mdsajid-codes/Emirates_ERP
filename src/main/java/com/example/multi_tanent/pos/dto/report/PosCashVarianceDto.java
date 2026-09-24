package com.example.multi_tanent.pos.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PosCashVarianceDto {
    private LocalDate date;
    private String entryNumber;
    private String referenceNumber;
    private BigDecimal varianceAmount;
    private String overOrShort;
}
