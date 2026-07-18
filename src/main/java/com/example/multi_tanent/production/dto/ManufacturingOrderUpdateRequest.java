package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.enums.Shift;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ManufacturingOrderUpdateRequest {
    private LocalDate productionDate;
    private Shift shift;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal finishedQuantity;
    private String remarks;
    private Long assignToId;
}
