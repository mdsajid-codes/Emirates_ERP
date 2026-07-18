package com.example.multi_tanent.hanger.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class HngJobCardRequest {
    @NotNull(message = "Batch ID is required")
    private Long batchId;

    private Long workstationId;
    private String toolDieNo;
    private Long operatorId;
    private String shift;

    private Integer targetQty;
    private Integer producedQty;
    private Integer rejectedQty;
    private Integer reworkQty;

    private BigDecimal laborHours;
    private BigDecimal workstationRunHours;
    private BigDecimal breakdownTime;

    private BigDecimal actualShoulderWidthMm;
    private BigDecimal actualHookSizeMm;

    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String remarks;
}
