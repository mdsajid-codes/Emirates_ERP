package com.example.multi_tanent.warehouse.dto;

import com.example.multi_tanent.warehouse.enums.TransferStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferOrderResponse {

    private Long id;
    private String transferNumber;

    private Long sourceWarehouseId;
    private String sourceWarehouseName;
    private String sourceWarehouseCode;

    private Long destinationWarehouseId;
    private String destinationWarehouseName;
    private String destinationWarehouseCode;

    private TransferStatus status;

    private LocalDate requestedDate;
    private LocalDateTime dispatchedDate;
    private LocalDateTime receivedDate;

    private String remarks;

    private Long createdBy;
    private Long approvedBy;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<TransferOrderItemResponse> items;
}
