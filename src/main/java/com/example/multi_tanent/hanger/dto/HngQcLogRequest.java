package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.QcResult;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class HngQcLogRequest {
    private Long batchId;
    private Long inspectorId;
    private Integer sampleSize;
    private Integer inspectedQty;
    private Integer passedQty;
    private Integer rejectedQty;
    private Integer reworkQty;
    private String defectType;
    private QcResult qcResult;
    private Boolean loadTestPassed;
    private String remarks;

    private com.example.multi_tanent.hanger.enums.ScrapReasonCode scrapReasonCode;
    private BigDecimal materialWeightLost;
    private String testType;
    private BigDecimal measuredValue;
}
