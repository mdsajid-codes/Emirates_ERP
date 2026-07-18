package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class WorkScheduleDayResponse {
    private Long id;
    private String dayOfWeek;
    private BigDecimal workingHours;
    private Boolean isWorkingDay;
}
