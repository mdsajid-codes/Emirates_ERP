package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.CoatingType;
import jakarta.validation.constraints.NotNull;
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
public class HngCoatingLogRequest {

    @NotNull(message = "Batch ID is required")
    private Long batchId;

    @NotNull(message = "Coating Type is required")
    private CoatingType coatingType;

    private String colorCode;

    private Long workstationId;

    private Long operatorId;

    private String shift;

    @NotNull(message = "Input quantity is required")
    private Integer inputQty;

    @NotNull(message = "Produced quantity is required")
    private Integer producedQty;

    private Integer rejectedQty;

    private Integer reworkQty;

    private BigDecimal paintConsumedKg;

    private String chemicalBatch;

    private BigDecimal temperatureC;

    private BigDecimal coatingThicknessMm;

    private BigDecimal durationMin;

    private OffsetDateTime startTime;

    private OffsetDateTime endTime;

    private String remarks;
}
