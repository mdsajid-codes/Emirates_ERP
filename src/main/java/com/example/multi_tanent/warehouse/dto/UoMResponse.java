package com.example.multi_tanent.warehouse.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UoMResponse {
    private Long id;
    private String name;
    private String shortName;
}
