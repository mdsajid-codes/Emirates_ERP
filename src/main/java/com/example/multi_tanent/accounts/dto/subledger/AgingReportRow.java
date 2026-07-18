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
public class AgingReportRow {
    private Long partyId;
    private String partyName;
    
    @Builder.Default
    private BigDecimal totalOutstanding = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal current = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal days1to30 = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal days31to60 = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal days61to90 = BigDecimal.ZERO;
    
    @Builder.Default
    private BigDecimal daysOver90 = BigDecimal.ZERO;
}
