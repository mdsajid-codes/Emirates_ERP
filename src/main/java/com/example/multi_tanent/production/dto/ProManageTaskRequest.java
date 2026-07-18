package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ProManageTask;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class ProManageTaskRequest {

    private Long locationId; // Optional

    @NotNull(message = "Work group ID is required.")
    private Long workGroupId;

    private Long workstationId; // Optional

    @NotNull(message = "Task ID is required.")
    private Long taskId;

    @NotNull(message = "Frequency is required.")
    private ProManageTask.Frequency frequency;

    private LocalDate lastPerformedOn;
    private Integer alertBeforeDays;
    private Set<Long> notifyEmployeeIds;
}