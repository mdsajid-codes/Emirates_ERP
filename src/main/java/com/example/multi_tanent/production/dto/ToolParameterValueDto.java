package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ToolParameterValueDto {
    private Long id;
    private String value;
    private Integer position;
}