package com.example.multi_tanent.purchases.dto;

// package com.example.multi_tanent.purchases.dto;

import lombok.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchasePaymentAllocationRequest {
    private Long id; // optional when updating existing allocation
    @NotNull
    private Long invoiceId;
    @NotNull
    @DecimalMin("0.000001")
    private BigDecimal allocatedAmount;
    private String allocationNote;
}
