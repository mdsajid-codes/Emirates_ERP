package com.example.multi_tanent.accounts.dto.settlement;

import com.example.multi_tanent.accounts.entity.enums.SettlementStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class AccMutualSettlementResponse {
    private Long id;
    private String settlementNumber;
    private LocalDate settlementDate;
    private Long partnerId;
    private String partnerName;
    private Long currencyId;
    private BigDecimal settlementAmount;
    private SettlementStatus status;
    private Long journalEntryId;
    private Long reversalEntryId;
    private String notes;
    private String createdBy;
    private LocalDateTime createdAt;
    private String tenantId;
    
    private List<AccMutualSettlementLineResponse> apLines;
    private List<AccMutualSettlementLineResponse> arLines;

    @Data
    public static class AccMutualSettlementLineResponse {
        private Long id;
        private Long invoiceId;
        private String invoiceNumber;
        private LocalDate invoiceDate;
        private BigDecimal invoiceTotal;
        private BigDecimal allocatedAmount;
    }
}
