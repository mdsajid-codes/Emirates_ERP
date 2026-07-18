package com.example.multi_tanent.warehouse.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferOrderItemRequest {

    private Long id; // optional, used for updates

    @NotNull(message = "Product cannot be null")
    private Long productId;

    private Long batchId;

    @NotNull(message = "Requested quantity is required")
    @Positive(message = "Requested quantity must be positive")
    private BigDecimal requestedQty;

    private BigDecimal dispatchedQty;
    
    private BigDecimal receivedQty;

    private Long sourceBinId;
    
    private Long destinationBinId;

    private String remarks;
}
