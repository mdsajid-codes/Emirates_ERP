package com.example.multi_tanent.materials.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class MaterialReservationDetailRequest {
    private Long rawMaterialId;
    private BigDecimal reservedQuantity;
}
