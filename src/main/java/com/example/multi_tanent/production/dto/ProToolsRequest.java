package com.example.multi_tanent.production.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ProToolsRequest {

    @NotBlank(message = "Tool name is required.")
    @Size(max = 150)
    private String name;

    private LocalDate manufacturingDate;

    @NotNull(message = "Work group ID is required.")
    private Long workGroupId;

    private Long workstationId; // Optional

    @NotNull(message = "Category ID is required.")
    private Long categoryId;

    private Long locationId; // Optional

    @Valid
    private List<ProToolStationRequest> stations;

    @Valid
    private List<ToolParameterRequest> parameters;
}