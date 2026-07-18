package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.entity.MaterialReservationDetail;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class MaterialReservationDetailResponse {
    private Long id;
    private Long rawMaterialId;
    private String rawMaterialName;
    private String rawMaterialCode;
    private BigDecimal reservedQuantity;

    public static MaterialReservationDetailResponse fromEntity(MaterialReservationDetail entity) {
        return MaterialReservationDetailResponse.builder()
                .id(entity.getId())
                .rawMaterialId(entity.getRawMaterial() != null ? entity.getRawMaterial().getId() : null)
                .rawMaterialName(entity.getRawMaterial() != null ? entity.getRawMaterial().getName() : null)
                .rawMaterialCode(entity.getRawMaterial() != null ? entity.getRawMaterial().getItemCode() : null)
                .reservedQuantity(entity.getReservedQuantity())
                .build();
    }
}
