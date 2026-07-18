package com.example.multi_tanent.production.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.List;

@Data
public class ProWorkStationRequest {

    @NotNull(message = "Work group ID is required.")
    private Long workGroupId;

    @NotBlank(message = "Workstation name is required.")
    @Size(max = 255)
    private String workstationName;

    private List<Long> employeeIds;

    private Long locationId; // Optional: ID of the location to associate with
    private String machineId;
    private String machineType;
    private Integer capacity;
}