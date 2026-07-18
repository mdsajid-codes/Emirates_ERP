package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class ToolParameterDto {
    private Long id;
    private String name;
    private List<ToolParameterValueDto> values;
}