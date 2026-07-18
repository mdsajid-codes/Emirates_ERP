package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CrmCallLogRequestDto {
    private String comments;

    @NotNull(message = "Call date is required")
    private LocalDate callDate;

    private LocalTime callTime;
    private boolean remindMeBefore;
    private LocalTime reminderTime;
    private Long employeeId;
    private Long leadId;
    private Long contactId;
}