package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class WorkCalendarExceptionResponse {
    private Long id;
    private Long holidayPolicyId;
    private String holidayPolicyName;
    private LocalDate exceptionDate;
    private Boolean workingDay;
    private String reason;
}
