package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurDebitNoteItemResponse {
    private Long id;
    private Long itemId;
    private String itemName;
    private Long locationId;
    private String locationName;
    private Double quantity;
    private BigDecimal rate;
    private BigDecimal discount;
    private BigDecimal amount;
    private Long taxId;
    private String taxName;
    private BigDecimal taxValue;
    private BigDecimal taxAmount;
}
