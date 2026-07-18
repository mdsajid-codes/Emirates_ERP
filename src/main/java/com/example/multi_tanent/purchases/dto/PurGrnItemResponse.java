package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurGrnItemResponse {
    private Long id;
    private Long purchaseOrderItemId;
    private String itemName;
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
    private String materialType;
    private java.math.BigDecimal wireGaugeMm;
    private java.math.BigDecimal grossWeightKg;
    private java.math.BigDecimal tareWeightKg;
    private java.math.BigDecimal netWeightKg;
    private java.math.BigDecimal ratePerKg;
    private java.math.BigDecimal totalValue;
    private String millCertificateUrl;
    private String warehouseLocation;
    private String coilNo;
}
