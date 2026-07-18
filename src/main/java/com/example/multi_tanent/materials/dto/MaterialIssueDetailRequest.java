package com.example.multi_tanent.materials.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MaterialIssueDetailRequest {
    private Long rawMaterialId;
    private Long processId;
    private BigDecimal issuedQuantity;

    // Hanger Phase 3 fields
    private Long coilRefId;
    private BigDecimal issuedWeightKg;
    private Long warehouseId;
}
