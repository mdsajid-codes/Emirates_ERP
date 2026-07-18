package com.example.multi_tanent.accounts.dto.subledger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartySubLedgerResponse {
    private Long partyId;
    private String partyName;
    private String partyCode;
    
    @Builder.Default
    private BigDecimal totalDebit = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal totalCredit = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal balance = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal agingCurrent = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal aging30 = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal aging60 = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal aging90 = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal agingOver90 = BigDecimal.ZERO;
}
