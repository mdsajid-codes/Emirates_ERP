package com.example.multi_tanent.materials.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MaterialIndentDetailRequest {
    private Long rawMaterialId;
    private Long processId;
    private BigDecimal indentQuantity;
    private String remarks;
    private String additionalDescription;
}
