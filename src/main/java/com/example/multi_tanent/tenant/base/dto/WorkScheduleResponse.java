package com.example.multi_tanent.tenant.base.dto;

import lombok.Data;
import java.util.List;

@Data
public class WorkScheduleResponse {
    private Long id;
    private String name;
    private String code;
    private Integer totalWeeklyHours;
    private Boolean active;
    private HolidayPolicySummary holidayPolicy;
    private List<WorkScheduleDayResponse> days;

    @Data
    public static class HolidayPolicySummary {
        private Long id;
        private String name;
        private Integer year;
    }
}
