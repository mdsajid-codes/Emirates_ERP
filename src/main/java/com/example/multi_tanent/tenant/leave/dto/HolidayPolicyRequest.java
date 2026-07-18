package com.example.multi_tanent.tenant.leave.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class HolidayPolicyRequest {
    @NotBlank(message = "Policy name is required")
    private String name;

    @NotNull(message = "Year is required")
    @Min(value = 2000, message = "Year must be 2000 or later")
    private int year;

    @Valid
    private List<HolidayRequest> holidays;
}