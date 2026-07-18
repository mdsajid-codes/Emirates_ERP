package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ManufacturingOrder;
import com.example.multi_tanent.production.entity.ManufacturingOrderFile;
import com.example.multi_tanent.production.enums.ManufacturingOrderStatus;
import com.example.multi_tanent.production.enums.Shift;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ManufacturingOrderResponse {

    private Long id;
    private String moNumber;
    private String soNumber;
    private Long salesOrderId;
    private String customerName;
    private Long customerId;
    private String referenceNo;
    private String itemCode;
    private String itemName;
    private Long itemId;
    private BigDecimal quantity;
    private Long rawMaterialId;
    private String rawMaterialName;
    private Long finishedGoodId;
    private String finishedGoodName;
    private Long crmProductId;
    private String crmProductName;
    private Long categoryId;
    private String categoryName;
    private Long subCategoryId;
    private String subCategoryName;
    private BigDecimal wastage;
    private ManufacturingOrderStatus status;
    private OffsetDateTime scheduleStart;
    private OffsetDateTime scheduleFinish;
    private OffsetDateTime dueDate;
    private OffsetDateTime actualStart;
    private OffsetDateTime actualFinish;
    private String assignToName;
    private Long assignToId;
    private String batchNo;
    private String samplingRequestStatus;
    private String samaplingRequestStatus;
    private String bomName;
    private Long bomId;
    private String bomFinishedGoodName;
    private Long bomFinishedGoodId;
    private String productionHouseName;
    private Long productionHouseId;
    private LocalDate productionDate;
    private Shift shift;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal finishedQuantity;
    private String remarks;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Hanger Phase 3 fields
    private Long hangerTypeId;
    private String hangerTypeName;
    private BigDecimal wireGaugeRequired;
    private BigDecimal requiredWireKg;
    private Long costCenterId;

    @Builder.Default
    private List<ManufacturingOrderFileResponse> files = new ArrayList<>();

    public static ManufacturingOrderResponse fromEntity(ManufacturingOrder entity) {
        return ManufacturingOrderResponse.builder()
                .id(entity.getId())
                .moNumber(entity.getMoNumber())
                .soNumber(entity.getSalesOrder() != null ? entity.getSalesOrder().getSalesOrderNumber() : null)
                .salesOrderId(entity.getSalesOrder() != null ? entity.getSalesOrder().getId() : null)
                .customerName(entity.getCustomer() != null ? entity.getCustomer().getPrimaryContactPersonFull() : null)
                .customerId(entity.getCustomer() != null ? entity.getCustomer().getId() : null)
                .referenceNo(entity.getReferenceNo())
                .itemCode(entity.getItem() != null ? entity.getItem().getItemCode() : null)
                .itemName(entity.getItem() != null ? entity.getItem().getName() : null)
                .itemId(entity.getItem() != null ? entity.getItem().getId() : null)
                .quantity(entity.getQuantity())
                .rawMaterialId(entity.getProRawMaterial() != null ? entity.getProRawMaterial().getId() : null)
                .rawMaterialName(entity.getProRawMaterial() != null ? entity.getProRawMaterial().getName() : null)
                .finishedGoodId(entity.getProFinishedGood() != null ? entity.getProFinishedGood().getId() : null)
                .finishedGoodName(entity.getProFinishedGood() != null ? entity.getProFinishedGood().getName() : null)
                .crmProductId(entity.getCrmProduct() != null ? entity.getCrmProduct().getId() : null)
                .crmProductName(entity.getCrmProduct() != null ? entity.getCrmProduct().getName() : null)
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .subCategoryId(entity.getSubCategory() != null ? entity.getSubCategory().getId() : null)
                .subCategoryName(entity.getSubCategory() != null ? entity.getSubCategory().getName() : null)
                .wastage(entity.getWastage())
                .status(entity.getStatus())
                .scheduleStart(entity.getScheduleStart())
                .scheduleFinish(entity.getScheduleFinish())
                .dueDate(entity.getDueDate())
                .actualStart(entity.getActualStart())
                .actualFinish(entity.getActualFinish())
                .assignToName(entity.getAssignTo() != null ? entity.getAssignTo().getName() : null)
                .assignToId(entity.getAssignTo() != null ? entity.getAssignTo().getId() : null)
                .batchNo(entity.getBatchNo())
                .samplingRequestStatus(entity.getSamplingRequestStatus())
                .samplingRequestStatus(entity.getSamplingRequestStatus())
                .bomName(entity.getBom() != null ? entity.getBom().getBomName() : null)
                .bomId(entity.getBom() != null ? entity.getBom().getId() : null)
                .bomFinishedGoodName(
                        entity.getBomFinishedGood() != null ? entity.getBomFinishedGood().getBomName() : null)
                .bomFinishedGoodId(entity.getBomFinishedGood() != null ? entity.getBomFinishedGood().getId() : null)
                .productionHouseName(entity.getProductionHouse() != null ? entity.getProductionHouse().getName() : null)
                .productionHouseId(entity.getProductionHouse() != null ? entity.getProductionHouse().getId() : null)
                .productionDate(entity.getProductionDate())
                .shift(entity.getShift())
                .startTime(entity.getStartTime())
                .endTime(entity.getEndTime())
                .finishedQuantity(entity.getFinishedQuantity())
                .remarks(entity.getRemarks())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .files(entity.getFiles() != null ? entity.getFiles().stream()
                        .map(f -> ManufacturingOrderFileResponse.builder()
                                .id(f.getId())
                                .fileName(f.getFileName())
                                // URL construction will be handled by service or mapper if possible,
                                // but for now we might need to inject it or return relative path.
                                .fileUrl(f.getFilePath())
                                .build())
                        .collect(Collectors.toList()) : new ArrayList<>())
                .hangerTypeId(entity.getHangerType() != null ? entity.getHangerType().getId() : null)
                .hangerTypeName(entity.getHangerType() != null ? entity.getHangerType().getTypeName().name() : null)
                .wireGaugeRequired(entity.getWireGaugeRequired())
                .requiredWireKg(entity.getRequiredWireKg())
                .costCenterId(entity.getCostCenterId())
                .build();
    }

    // Helper to set File URLs if needed (since entity only has path)
    public void setFileUrls(String baseUrl) {
        if (files != null) {
            files.forEach(f -> {
                // Logic to build full URL if needed
            });
        }
    }
}
