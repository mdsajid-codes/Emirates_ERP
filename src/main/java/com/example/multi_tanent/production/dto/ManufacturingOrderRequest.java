package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.enums.ManufacturingOrderStatus;
import com.example.multi_tanent.production.enums.Shift;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ManufacturingOrderRequest {

    private Long productionHouseId; // productionHouse

    @NotNull(message = "MO Number is required")
    private String moNumber;

    private Long salesOrderId;

    private Long customerId;

    private String referenceNo;

    private Long itemId;
    private Long rawMaterialId;
    private Long semiFinishedId; // Alias for itemId if needed, distinct from itemId logic
    private Long finishedGoodId;
    private Long crmProductId;
    private Long categoryId;
    private Long subCategoryId;
    private BigDecimal wastage;

    private BigDecimal quantity;

    private ManufacturingOrderStatus status;

    private OffsetDateTime scheduleStart;
    private OffsetDateTime scheduleFinish;
    private OffsetDateTime dueDate;
    private OffsetDateTime actualStart;
    private OffsetDateTime actualFinish;

    private Long assignToId;

    private String batchNo;

    private String samplingRequestStatus;

    private Long bomId;
    private Long bomFinishedGoodId;

    private LocalDate productionDate;
    private Shift shift;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal finishedQuantity;
    private String remarks;

    // Hanger Phase 3 fields
    private Long hangerTypeId;
    private BigDecimal wireGaugeRequired;
    private BigDecimal requiredWireKg;
    private Long costCenterId;
}
