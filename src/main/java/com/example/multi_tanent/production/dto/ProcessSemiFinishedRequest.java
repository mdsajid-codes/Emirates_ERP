package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessSemiFinishedRequest {
    private Long itemId;
    private String processFlowName;
    private BigDecimal otherFixedCost;
    private BigDecimal otherVariableCost;
    private boolean isLocked;
    private List<ProcessSemiFinishedDetailRequest> details;
    private Long locationId;
}
