package com.example.multi_tanent.hanger.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class HngWireProcessingRequest {
    @NotNull(message = "Batch ID is required")
    private Long batchId;

    private Long workStationId;
    private Long operatorId;
    private String shift;
    private String costCenter;

    private BigDecimal cuttingLengthCm;
    private Integer producedQty;
    private Integer scrapQty;

    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String remarks;

    // Optional scrap details for auto-creation
    private String scrapType; // RETURNABLE / NON_RETURNABLE
    private BigDecimal scrapRatePerKg;
}
