package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurDebitNoteItemRequest {
    private Long itemId;
    private Long locationId;
    private Double quantity;
    private BigDecimal rate;
    private BigDecimal discount;
    private BigDecimal amount;
    private Long taxId;
    private BigDecimal taxValue;
    private BigDecimal taxAmount;
}
