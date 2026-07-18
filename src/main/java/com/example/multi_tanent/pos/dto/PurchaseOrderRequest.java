package com.example.multi_tanent.pos.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class PurchaseOrderRequest {
    @NotNull(message = "Store ID is required.")
    private Long storeId;

    @NotBlank(message = "Supplier name is required.")
    private String supplierName;

    private String status;

    @NotEmpty(message = "Purchase order must have at least one item.")
    @Valid
    private List<PurchaseOrderItemRequest> items;
}