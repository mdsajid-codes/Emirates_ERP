package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BomSemiFinishedDetailRequest {
    private Long processId;
    private Long rawMaterialId;
    private Long semiFinishedId;
    private BigDecimal quantity;
    private Long uomId;
    private BigDecimal rate;
    private BigDecimal amount;
    private String notes;
    private Integer sequence;
}
