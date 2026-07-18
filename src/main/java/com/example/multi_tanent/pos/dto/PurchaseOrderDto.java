package com.example.multi_tanent.pos.dto;

import lombok.Data;

import java.time.OffsetDateTime;
import java.util.List;

@Data
public class PurchaseOrderDto {
    private Long id;
    private Long storeId;
    private String storeName;
    private String poNumber;
    private String supplierName;
    private String status;
    private OffsetDateTime createdAt;
    private List<PurchaseOrderItemDto> items;
    private Long totalCostCents;
}