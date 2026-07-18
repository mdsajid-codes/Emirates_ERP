package com.example.multi_tanent.purchases.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingSupplierItemResponse {
    private Long id;
    private Long tenderingItemId;
    private Boolean selected;
}
