package com.example.multi_tanent.purchases.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingSupplierItemRequest {
    private Long tenderingItemId; // refers to the PurSupplierTenderingItem ID (only valid on update) or index if new
    private Boolean selected;
}
