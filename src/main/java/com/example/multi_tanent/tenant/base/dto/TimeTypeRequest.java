package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;

@Data
public class TimeTypeRequest {
    private String code;
    private String name;
    private String numericCode;
    private Boolean isWorkingTime;
    private Boolean isUnpaidTime;
}