package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.ScrapStage;
import com.example.multi_tanent.hanger.enums.ScrapType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class HngScrapEntryResponse {
    private Long id;
    private Long batchId;
    private String batchNo;
    private Long wireProcessingId;
    private ScrapStage stage;
    private ScrapType scrapType;
    private BigDecimal scrapWeightKg;
    private BigDecimal ratePerKg;
    private BigDecimal scrapValue;
    private String remarks;
    private OffsetDateTime createdAt;
}
