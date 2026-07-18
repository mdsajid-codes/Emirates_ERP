package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.SealStatus;
import lombok.*;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HngPackingCartonResponse {
    private Long id;
    private String cartonNo;
    private Integer bundlesInCarton;
    private Integer qtyInCarton;
    private BigDecimal grossWeightKg;
    private SealStatus sealStatus;
}
