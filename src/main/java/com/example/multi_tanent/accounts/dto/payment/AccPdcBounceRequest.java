package com.example.multi_tanent.accounts.dto.payment;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AccPdcBounceRequest {
    private LocalDate bounceDate;
    private BigDecimal bankCharges;
    private Long bankAccountId;
    private Long bankChargesGlAccountId;
}
