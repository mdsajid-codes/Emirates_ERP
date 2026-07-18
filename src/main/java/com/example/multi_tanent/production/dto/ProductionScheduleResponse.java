package com.example.multi_tanent.production.dto;

import lombok.Builder;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
@Builder
public class ProductionScheduleResponse {
    private Long id;
    private Long resourceId; // Can be workGroupId or employeeId
    private String title;
    private OffsetDateTime start;
    private OffsetDateTime end;
    private com.example.multi_tanent.production.enums.ManufacturingOrderStatus status;
    private String notes;
    private String resourceType; // "WORK_GROUP" or "EMPLOYEE"

    // Additional details that might be useful for tooltip or modal
    private Long manufacturingOrderId;
    private String manufacturingOrderNumber;
    private String itemName;
}
