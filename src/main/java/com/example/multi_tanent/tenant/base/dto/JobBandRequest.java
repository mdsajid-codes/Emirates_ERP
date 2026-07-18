package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;

@Data
public class JobBandRequest {
    private String name;
    private Integer level;
    private Long minSalary;
    private Long maxSalary;
    private String notes;
}