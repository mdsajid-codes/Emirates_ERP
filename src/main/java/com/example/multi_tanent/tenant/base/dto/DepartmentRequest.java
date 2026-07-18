package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;

@Data
public class DepartmentRequest {
    private String name;
    private String code;
    private String description;
}