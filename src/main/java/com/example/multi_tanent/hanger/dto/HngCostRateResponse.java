package com.example.multi_tanent.hanger.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngCostRateResponse {
    private Long id;
    private String rateKey;
    private String rateLabel;
    private BigDecimal rateValue;
    private String unit;
    private LocalDate effectiveFrom;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
