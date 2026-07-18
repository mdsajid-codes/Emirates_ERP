package com.example.multi_tanent.hanger.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class HngJobCardResponse {
    private Long id;
    private Long batchId;
    private String batchNo;
    private String jobCardNo;
    private Long workstationId;
    private String workstationName;
    private String toolDieNo;
    private Long operatorId;
    private String operatorName;
    private String shift;

    private Integer plannedQty;
    private Integer targetQty;
    private Integer producedQty;
    private Integer rejectedQty;
    private Integer reworkQty;

    private BigDecimal laborHours;
    private BigDecimal workstationRunHours;
    private BigDecimal breakdownTime;

    private BigDecimal cycleTimeSec;
    private BigDecimal availabilityPct;
    private BigDecimal performancePct;
    private BigDecimal qualityPct;
    private BigDecimal oeePct;

    private BigDecimal actualShoulderWidthMm;
    private BigDecimal actualHookSizeMm;
    private Boolean dimensionPass;

    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String remarks;
    private OffsetDateTime createdAt;
}
