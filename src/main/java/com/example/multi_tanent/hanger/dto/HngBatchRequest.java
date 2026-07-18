package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.BatchStage;
import com.example.multi_tanent.hanger.enums.BatchStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HngBatchRequest {
    @NotNull(message = "Manufacturing Order ID is required")
    private Long moId;

    private Long coilRefId;
    private Long hangerTypeId;
    private String color;

    @NotNull(message = "Planned quantity is required")
    private Integer plannedQty;

    private String shift;
    private Long workStationId;
    private String remarks;

    private BatchStatus status;
    private BatchStage currentStage;

    private Integer actualQty;
    private java.math.BigDecimal actualWireUsedKg;
}
