package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.PackingStatus;
import com.example.multi_tanent.hanger.enums.RemainderDisposition;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import com.example.multi_tanent.hanger.dto.HngPackingCartonResponse;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HngBatchPackingResponse {
    private Long id;
    private Long batchId;
    private String batchNo;
    private Long salesOrderId;
    private String salesOrderNo;
    private String packingBatchNo;
    private Long operatorId;
    private String operatorName;
    private Integer bundleSize;
    private Integer totalBundles;
    private Integer packedQty;
    private Integer remainderQty;
    private RemainderDisposition remainderDisposition;
    private BigDecimal grossWeightKg;
    private BigDecimal netWeightKg;
    private String cartonSize;
    private Integer totalCartons;
    private Long wareProductBatchId;
    private Long deliveryOrderId;
    private String deliveryOrderNo;
    private PackingStatus status;
    private String remarks;
    private List<HngPackingCartonResponse> cartons;
    private OffsetDateTime createdAt;
}
