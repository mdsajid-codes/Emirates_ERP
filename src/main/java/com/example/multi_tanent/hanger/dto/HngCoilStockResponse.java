package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.CoilInspectionStatus;
import com.example.multi_tanent.hanger.enums.CoilStatus;
import com.example.multi_tanent.hanger.enums.WireMaterialType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class HngCoilStockResponse {

    private Long id;
    private String coilNo;
    private Long grnItemId;
    private String lotNo;
    private String heatNo;
    private String supplierName;
    private WireMaterialType materialType;
    private BigDecimal wireGaugeMm;
    private BigDecimal totalWeightKg;
    private BigDecimal remainingWeightKg;
    private BigDecimal ratePerKg;
    private String warehouseLocation;
    private CoilInspectionStatus inspectionStatus;
    private CoilStatus status;
    private String barcodeQr;
    private String millCertificateUrl;
    private LocalDate receivedDate;
    private String qcRemarks;

    // Derived / calculated fields
    private BigDecimal usedWeightKg; // totalWeight - remainingWeight
    private BigDecimal remainingPct; // remainingWeight / totalWeight * 100
    private BigDecimal estimatedCoilValue; // remainingWeight × ratePerKg

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
