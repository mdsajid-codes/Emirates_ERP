package com.example.multi_tanent.pos.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PosTrialBalanceDto {
    private String accountCode;
    private String accountName;
    private BigDecimal drTotal;
    private BigDecimal crTotal;
    private BigDecimal net;
}
