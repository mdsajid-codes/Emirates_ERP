package com.example.multi_tanent.warehouse.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareProductSerialResponse {
    private Long id;
    private String serialNumber;
    private Long batchId;
    private String batchNumber;
    private LocalDateTime createdAt;
}
