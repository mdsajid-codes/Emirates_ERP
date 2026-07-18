package com.example.multi_tanent.crm.dto;



import java.math.BigDecimal;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmKpiEmployeeResponse {
    private Long id;
    private Long kpiId;
    private String kpiName;
    private EmployeeSlimDto employee;
    private String employeeName;
    private Double targetValue;
}
