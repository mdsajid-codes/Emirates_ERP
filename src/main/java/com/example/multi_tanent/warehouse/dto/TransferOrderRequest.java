package com.example.multi_tanent.warehouse.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferOrderRequest {

    @NotNull(message = "Source warehouse is required")
    private Long sourceWarehouseId;

    @NotNull(message = "Destination warehouse is required")
    private Long destinationWarehouseId;

    private LocalDate requestedDate;

    private String remarks;

    @Valid
    @NotEmpty(message = "At least one item is required for transfer")
    private List<TransferOrderItemRequest> items;
}
