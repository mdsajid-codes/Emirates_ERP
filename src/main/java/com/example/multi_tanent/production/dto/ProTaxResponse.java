package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ProTax;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ProTaxResponse {
    private Long id;
    private String code;
    private BigDecimal rate;
    private String description;
    private Long locationId;
    private String locationName;

    public static ProTaxResponse fromEntity(ProTax entity) {
        return ProTaxResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .rate(entity.getRate())
                .description(entity.getDescription())
                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                .build();
    }
}