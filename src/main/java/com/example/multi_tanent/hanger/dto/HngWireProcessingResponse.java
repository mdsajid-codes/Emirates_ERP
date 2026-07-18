package com.example.multi_tanent.hanger.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class HngWireProcessingResponse {
    private Long id;
    private Long batchId;
    private String batchNo;
    private Long workStationId;
    private String workStationName;
    private Long operatorId;
    private String operatorName;
    private String shift;
    private String costCenter;

    private BigDecimal cuttingLengthCm;
    private Integer plannedQty;
    private Integer producedQty;
    private Integer scrapQty;

    private BigDecimal scrapWeightKg;
    private BigDecimal scrapPct;
    private BigDecimal productivityPcsPerHour;

    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String remarks;
    private OffsetDateTime createdAt;
}
