package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProToolStationDto {
    private Long id;
    private String name;
    private Integer position;
}