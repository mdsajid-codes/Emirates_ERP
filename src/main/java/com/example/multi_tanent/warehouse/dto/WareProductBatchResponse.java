package com.example.multi_tanent.warehouse.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareProductBatchResponse {
    private Long id;
    private String batchNumber;
    private LocalDate mfgDate;
    private LocalDate expiryDate;
    private Long productId;
    private String productName;
    private LocalDateTime createdAt;
}
