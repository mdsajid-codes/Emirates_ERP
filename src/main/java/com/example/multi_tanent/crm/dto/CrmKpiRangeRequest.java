package com.example.multi_tanent.crm.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmKpiRangeRequest {
    private Long kpiId;

    private Long locationId; // Optional
    private Double fromPercent;
    private Double toPercent;
    private String color;
}
