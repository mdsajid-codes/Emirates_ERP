package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.entity.MaterialIndentDetail;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class MaterialIndentDetailResponse {
    private Long id;
    private Long rawMaterialId;
    private String rawMaterialName;
    private String rawMaterialCode;
    private Long processId;
    private String processName;
    private BigDecimal indentQuantity;
    private String remarks;
    private String additionalDescription;

    public static MaterialIndentDetailResponse fromEntity(MaterialIndentDetail entity) {
        return MaterialIndentDetailResponse.builder()
                .id(entity.getId())
                .rawMaterialId(entity.getRawMaterial() != null ? entity.getRawMaterial().getId() : null)
                .rawMaterialName(entity.getRawMaterial() != null ? entity.getRawMaterial().getName() : null)
                .rawMaterialCode(entity.getRawMaterial() != null ? entity.getRawMaterial().getItemCode() : null)
                .processId(entity.getProcess() != null ? entity.getProcess().getId() : null)
                .processName(entity.getProcess() != null ? entity.getProcess().getName() : null)
                .indentQuantity(entity.getIndentQuantity())
                .remarks(entity.getRemarks())
                .additionalDescription(entity.getAdditionalDescription())
                .build();
    }
}
