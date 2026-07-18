package com.example.multi_tanent.tenant.attendance.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class MissingAttendanceRequestDto {
    @NotNull(message = "Attendance date is required.")
    private LocalDate attendanceDate;
    private LocalTime requestedCheckIn;
    private LocalTime requestedCheckOut;
    @NotBlank(message = "Reason is required.")
    private String reason;
}