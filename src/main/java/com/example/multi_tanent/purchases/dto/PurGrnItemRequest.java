package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurGrnItemRequest {
    private Long purchaseOrderItemId;
    private BigDecimal receivedQuantity;
    private BigDecimal rate;
    private Long unitId;

    // QC / Rejection Handling Fields
    private BigDecimal acceptedQuantity;
    private BigDecimal rejectedQuantity;
    private String rejectionReason;

    // Hanger Coil Fields
    private Boolean isHangerCoil;
    private String heatNo;
    private String lotNo;
    private String materialType; // WireMaterialType enum string
    private BigDecimal wireGaugeMm;
    private BigDecimal grossWeightKg;
    private BigDecimal tareWeightKg;
    private BigDecimal ratePerKg;
    private String millCertificateUrl;
    private String warehouseLocation;
    private Long warehouseId;
}
