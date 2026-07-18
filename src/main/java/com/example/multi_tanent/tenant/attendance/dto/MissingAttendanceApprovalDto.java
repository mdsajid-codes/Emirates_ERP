package com.example.multi_tanent.tenant.attendance.dto;

import com.example.multi_tanent.tenant.attendance.enums.MissingAttendanceRequestStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MissingAttendanceApprovalDto {
    @NotNull
    private MissingAttendanceRequestStatus status; // Must be APPROVED or REJECTED
    private String approverRemarks;
}