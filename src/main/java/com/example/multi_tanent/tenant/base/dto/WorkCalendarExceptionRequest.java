package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class WorkCalendarExceptionRequest {
    private Long holidayPolicyId;
    private LocalDate exceptionDate;
    private Boolean workingDay;
    private String reason;
}
