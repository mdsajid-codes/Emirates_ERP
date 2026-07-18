package com.example.multi_tanent.tenant.leave.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class SickLeaveIntervalRequest {
    private Integer fromDay;
    private Integer toDay;
    private BigDecimal paymentPercent;
}
