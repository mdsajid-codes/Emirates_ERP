package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;
import java.util.List;

@Data
public class WorkScheduleRequest {
    private String name;
    private String code;
    private Long holidayPolicyId;
    private Boolean active = true;
    private List<WorkScheduleDayRequest> days;
}
