package com.example.multi_tanent.accounts.dto.settlement;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class AccMutualSettlementRequest {
    private LocalDate settlementDate;
    private Long partnerId;
    private Long currencyId;
    private String notes;
    private List<AccMutualSettlementLineRequest> apLines;
    private List<AccMutualSettlementLineRequest> arLines;

    @Data
    public static class AccMutualSettlementLineRequest {
        private Long invoiceId;
        private BigDecimal allocatedAmount;
    }
}
