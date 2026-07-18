package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.BatchStage;
import com.example.multi_tanent.hanger.enums.BatchStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class HngBatchResponse {
    private Long id;
    private Long tenantId;
    private String batchNo;
    private Long moId;
    private String moNumber;
    private Long coilRefId;
    private String coilNo;
    private Long hangerTypeId;
    private String hangerTypeName;
    private String color;
    private Integer plannedQty;
    private String shift;
    private Long workStationId;
    private String workStationName;
    private Long salesOrderId;
    private Long customerId;
    private BatchStatus status;
    private BatchStage currentStage;
    private String remarks;

    // Phase 12 Fields
    private Integer actualQty;
    private java.math.BigDecimal actualWireUsedKg;
    private java.time.OffsetDateTime completedAt;

    private java.time.OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
