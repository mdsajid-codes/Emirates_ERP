package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.HangerTypeEnum;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Data
public class HangerTypeResponse {

    private Long id;
    private HangerTypeEnum typeName;
    private BigDecimal unitWeightGrams;
    private BigDecimal standardWidthCm;
    private BigDecimal standardHookCm;
    private BigDecimal toleranceMm;
    private BigDecimal maxDefectPct;
    private Integer minQcSampleSize;
    private Integer defaultBundleSize;
    private BigDecimal minLoadTestKg;
    private BigDecimal standardWireGaugeMm;
    private Boolean isActive;
    private String description;
    private Long finishedGoodId;
    private String finishedGoodName;
    private String finishedGoodCode;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
