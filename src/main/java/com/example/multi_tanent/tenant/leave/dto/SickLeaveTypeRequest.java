package com.example.multi_tanent.tenant.leave.dto;

import com.example.multi_tanent.tenant.leave.enums.DailyEarningBase;
import com.example.multi_tanent.tenant.leave.enums.SickLeaveCalculationMethod;
import lombok.Data;
import java.util.List;

@Data
public class SickLeaveTypeRequest {
    private String name;
    private String description;
    private Long workTimeTypeId;
    private Long earningsTypeId;
    private SickLeaveCalculationMethod calculationMethod;
    private DailyEarningBase dailyEarningBase;
    private Integer averagingPeriodMonths;
    private Boolean active = true;
    private List<SickLeaveIntervalRequest> intervals;
}
