package com.example.multi_tanent.tenant.leave.dto;

import com.example.multi_tanent.tenant.leave.enums.DailyEarningBase;
import com.example.multi_tanent.tenant.leave.enums.SickLeaveCalculationMethod;
import lombok.Data;
import java.util.List;

@Data
public class SickLeaveTypeResponse {
    private Long id;
    private String name;
    private String description;
    private Long workTimeTypeId;
    private String workTimeTypeName;
    private Long earningsTypeId;
    private String earningsTypeName;
    private SickLeaveCalculationMethod calculationMethod;
    private DailyEarningBase dailyEarningBase;
    private Integer averagingPeriodMonths;
    private Boolean active;
    private List<SickLeaveIntervalResponse> intervals;
}
