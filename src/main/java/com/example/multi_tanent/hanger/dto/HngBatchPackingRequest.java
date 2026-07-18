package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.RemainderDisposition;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HngBatchPackingRequest {
    private Long batchId;
    private Long salesOrderId;
    private Long operatorId;
    private Integer bundleSize;
    private Integer totalBundles;
    private RemainderDisposition remainderDisposition;
    private BigDecimal grossWeightKg;
    private BigDecimal netWeightKg;
    private String cartonSize;
    private String remarks;
    private List<HngPackingCartonRequest> cartons;
}
