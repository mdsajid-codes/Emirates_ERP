package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessSemiFinishedDetailResponse {
    private Long id;
    private Long processId;
    private String processName;
    private Long workGroupId;
    private String workGroupName;
    private Integer setupTime;
    private Integer cycleTime;
    private BigDecimal fixedCost;
    private BigDecimal variableCost;
    private boolean isOutsource;
    private boolean isTesting;
    private String notes;
    private Integer sequence;
}
