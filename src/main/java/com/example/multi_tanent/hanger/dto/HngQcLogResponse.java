package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.QcResult;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
@Builder
public class HngQcLogResponse {
    private Long id;
    private String qcLogNo;
    private Long batchId;
    private String batchNo;
    private Long inspectorId;
    private String inspectorName;
    private Integer sampleSize;
    private Integer inspectedQty;
    private Integer passedQty;
    private Integer rejectedQty;
    private Integer reworkQty;
    private String defectType;
    private QcResult qcResult;
    private BigDecimal defectPct;
    private Boolean loadTestPassed;
    private String remarks;

    private com.example.multi_tanent.hanger.enums.ScrapReasonCode scrapReasonCode;
    private BigDecimal materialWeightLost;
    private String testType;
    private BigDecimal measuredValue;

    private OffsetDateTime createdAt;
}
