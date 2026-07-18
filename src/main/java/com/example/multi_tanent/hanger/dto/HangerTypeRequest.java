package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.HangerTypeEnum;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class HangerTypeRequest {

    @NotNull
    private HangerTypeEnum typeName;

    @NotNull
    @DecimalMin("0.1")
    private BigDecimal unitWeightGrams;

    @NotNull
    @DecimalMin("1.0")
    private BigDecimal standardWidthCm;

    @NotNull
    @DecimalMin("0.5")
    private BigDecimal standardHookCm;

    private BigDecimal toleranceMm;

    private BigDecimal maxDefectPct;

    @Min(1)
    private Integer minQcSampleSize;

    @Min(1)
    private Integer defaultBundleSize;

    private BigDecimal minLoadTestKg;

    private BigDecimal standardWireGaugeMm;

    private String description;

    /** Optional link to a ProFinishedGood for FG stock tracking */
    private Long finishedGoodId;
}
