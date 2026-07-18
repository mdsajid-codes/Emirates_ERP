package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurAdditionalExpenseLineRequest {
    private Long id;
    private Long productId;
    private BigDecimal amount;
    private Long taxId;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
}
