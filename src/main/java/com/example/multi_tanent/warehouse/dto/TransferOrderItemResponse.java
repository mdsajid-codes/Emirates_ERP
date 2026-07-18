package com.example.multi_tanent.warehouse.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferOrderItemResponse {

    private Long id;
    private Long transferOrderId;

    private Long productId;
    private String productCode;
    private String productName;
    private String productBarcode;

    private Long batchId;
    private String batchNumber;

    private BigDecimal requestedQty;
    private BigDecimal dispatchedQty;
    private BigDecimal receivedQty;

    private Long sourceBinId;
    private String sourceBinCode;

    private Long destinationBinId;
    private String destinationBinCode;

    private String remarks;
}
