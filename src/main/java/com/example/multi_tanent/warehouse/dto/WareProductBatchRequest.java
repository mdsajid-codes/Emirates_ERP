package com.example.multi_tanent.warehouse.dto;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareProductBatchRequest {
    private String batchNumber;
    private LocalDate mfgDate;
    private LocalDate expiryDate;
    private Long productId;
}
