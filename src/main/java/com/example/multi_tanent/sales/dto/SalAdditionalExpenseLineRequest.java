package com.example.multi_tanent.sales.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAdditionalExpenseLineRequest {
    private Long productId;
    private Long unitId;
    private BigDecimal amount;
    private Long taxId;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
}
