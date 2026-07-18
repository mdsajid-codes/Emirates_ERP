package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchasePaymentAllocationResponse {
    private Long id;
    private Long invoiceId;
    private String invoiceNumber; // if you want invoice reference/name
    private BigDecimal allocatedAmount;
    private String allocationNote;
}
