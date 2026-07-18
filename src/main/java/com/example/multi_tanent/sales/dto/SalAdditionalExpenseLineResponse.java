package com.example.multi_tanent.sales.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAdditionalExpenseLineResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String itemCode;
    private String category;
    private BigDecimal amount;
    private Long taxId;
    private String taxCode;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
}
