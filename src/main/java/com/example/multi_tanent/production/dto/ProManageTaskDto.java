package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ProManageTask;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.Set;

@Data
@Builder
public class ProManageTaskDto {
    private Long id;

    private Long locationId;
    private String locationName;

    private Long workGroupId;
    private String workGroupName;

    private Long workstationId;
    private String workstationName;

    private Long taskId;
    private String taskName;

    private ProManageTask.Frequency frequency;
    private LocalDate lastPerformedOn;
    private Integer alertBeforeDays;
    private Set<EmployeeSlimDto> notifyEmployees;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}