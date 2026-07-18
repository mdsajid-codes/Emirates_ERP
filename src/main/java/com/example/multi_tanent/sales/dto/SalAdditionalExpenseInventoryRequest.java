package com.example.multi_tanent.sales.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAdditionalExpenseInventoryRequest {
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
