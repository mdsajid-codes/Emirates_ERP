package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.entity.MaterialIssueDetail;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class MaterialIssueDetailResponse {
    private Long id;
    private Long rawMaterialId;
    private String rawMaterialName;
    private String rawMaterialCode;
    private Long processId;
    private String processName;
    private BigDecimal issuedQuantity;

    // Hanger Phase 3 fields
    private Long coilRefId;
    private String coilNo;
    private BigDecimal issuedWeightKg;
    private BigDecimal remainingWeightKgAfterIssue;

    public static MaterialIssueDetailResponse fromEntity(MaterialIssueDetail entity) {
        return MaterialIssueDetailResponse.builder()
                .id(entity.getId())
                .rawMaterialId(entity.getRawMaterial() != null ? entity.getRawMaterial().getId() : null)
                .rawMaterialName(entity.getRawMaterial() != null ? entity.getRawMaterial().getName() : null)
                .rawMaterialCode(entity.getRawMaterial() != null ? entity.getRawMaterial().getItemCode() : null)
                .processId(entity.getProcess() != null ? entity.getProcess().getId() : null)
                .processName(entity.getProcess() != null ? entity.getProcess().getName() : null)
                .issuedQuantity(entity.getIssuedQuantity())
                .coilRefId(entity.getCoilRef() != null ? entity.getCoilRef().getId() : null)
                .coilNo(entity.getCoilRef() != null ? entity.getCoilRef().getCoilNo() : null)
                .issuedWeightKg(entity.getIssuedWeightKg())
                .remainingWeightKgAfterIssue(
                        entity.getCoilRef() != null ? entity.getCoilRef().getRemainingWeightKg() : null)
                .build();
    }
}
