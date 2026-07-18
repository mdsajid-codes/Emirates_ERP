package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurAdditionalExpenseInventoryRequest {
    private Long id;
    private String documentType;
    private String documentId;
    private Long productId;
    private String batch;
    private BigDecimal quantity;
    private Long unitId;
    private BigDecimal price;
    private BigDecimal amount;
    private BigDecimal factor;
    private BigDecimal expenseAmount;
}
