package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRfqResponseItemResponse {
    private Long id;
    private Long tenderingItemId;
    private BigDecimal price;
    private String comment;
}
