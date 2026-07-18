package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProWorkGroupDto {
    private Long id;
    private String number;
    private String name;
    private String designation;
    private Integer numberOfEmployees;
    private Integer instanceCount;
    private BigDecimal hourlyRate;
    private Integer fixedWorkingMinutes;
    private boolean customWorkingHours;
    private String colorHex;
    private OffsetDateTime createdAt;
    private List<ProWorkGroupDayScheduleDto> daySchedules;
    private Long locationId;
    private String locationName;
}