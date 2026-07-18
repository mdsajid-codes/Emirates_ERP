package com.example.multi_tanent.hanger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngScrapSummaryResponse {
    private BigDecimal totalScrapWeightKg;
    private BigDecimal totalScrapValue;
    private int totalEntries;
    private Map<String, BigDecimal> weightByStage;
}
