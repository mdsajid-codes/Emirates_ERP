package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.CoatingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngCoatingLogResponse {

    private Long id;
    private Long batchId;
    private String batchNo;
    private String coatingLogNo;
    private CoatingType coatingType;
    private String colorCode;

    private Long workstationId;
    private String workstationName;

    private Long operatorId;
    private String operatorName;

    private String shift;

    private Integer inputQty;
    private Integer producedQty;
    private Integer rejectedQty;
    private Integer reworkQty;

    private BigDecimal paintConsumedKg;
    private String chemicalBatch;
    private BigDecimal temperatureC;
    private BigDecimal coatingThicknessMm;
    private BigDecimal durationMin;

    private BigDecimal rejectionPct;
    private Boolean colorPass;

    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private String remarks;
    private OffsetDateTime createdAt;
}
