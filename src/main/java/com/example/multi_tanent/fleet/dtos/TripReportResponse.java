package com.example.multi_tanent.fleet.dtos;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripReportResponse {
    private Long entityId;
    private String entityName;
    private Long tripCount;
    private BigDecimal amount;
    private BigDecimal commission;
    private BigDecimal totalAmount;
}
