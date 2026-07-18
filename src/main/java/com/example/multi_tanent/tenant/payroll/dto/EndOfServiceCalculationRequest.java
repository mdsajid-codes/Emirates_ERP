package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.enums.TerminationReason;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EndOfServiceCalculationRequest {
    @NotNull private LocalDate lastWorkingDay;

    @NotNull(message = "Termination reason is required.")
    private TerminationReason terminationReason;
}