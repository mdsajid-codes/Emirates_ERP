package com.example.multi_tanent.warehouse.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareProductSerialRequest {
    private String serialNumber;
    private Long batchId;
}
