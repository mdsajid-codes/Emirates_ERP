package com.example.multi_tanent.warehouse.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareTaxRequest {
    private String name;
    private BigDecimal percentage;
}
