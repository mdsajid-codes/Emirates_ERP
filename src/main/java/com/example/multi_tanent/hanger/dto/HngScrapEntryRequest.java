package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.ScrapStage;
import com.example.multi_tanent.hanger.enums.ScrapType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngScrapEntryRequest {
    @NotNull(message = "Batch ID is required")
    private Long batchId;

    private Long wireProcessingId;
    private Long coatingLogId;
    private Long qcLogId;

    @NotNull(message = "Stage is required")
    private ScrapStage stage;

    @NotNull(message = "Scrap type is required")
    private ScrapType scrapType;

    @NotNull(message = "Scrap weight is required")
    private BigDecimal scrapWeightKg;

    private BigDecimal ratePerKg;
    private String remarks;
}
