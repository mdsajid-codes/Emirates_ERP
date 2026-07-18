package com.example.multi_tanent.tenant.payroll.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeBenefitProvisionRequest {
    @NotBlank(message = "Employee code is required.")
    private String employeeCode;
    @NotNull(message = "Benefit type ID is required.")
    private Long benefitTypeId;
    @NotNull private LocalDate cycleStartDate;
    @NotNull @Future private LocalDate cycleEndDate;
}