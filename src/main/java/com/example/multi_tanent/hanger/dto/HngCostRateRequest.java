package com.example.multi_tanent.hanger.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngCostRateRequest {
    private String rateKey;
    private String rateLabel;
    private BigDecimal rateValue;
    private String unit;
    private LocalDate effectiveFrom;
    private Boolean isActive;
}
