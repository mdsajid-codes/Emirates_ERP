package com.example.multi_tanent.production.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProWorkGroupRequest {

    @NotBlank(message = "Work group name is required.")
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String designation;

    @NotNull
    @Min(value = 0, message = "Number of employees cannot be negative.")
    private Integer numberOfEmployees;

    @NotNull
    @Min(value = 1, message = "Instance count must be at least 1.")
    private Integer instanceCount;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "Hourly rate must be positive.")
    private BigDecimal hourlyRate;

    private Integer fixedWorkingMinutes;

    @NotNull
    private boolean customWorkingHours;

    @Pattern(regexp = "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$", message = "Invalid hex color format.")
    private String colorHex;

    @Valid
    private List<ProWorkGroupDayScheduleDto> daySchedules;

    private Long locationId; // Optional: ID of the location to associate with
}