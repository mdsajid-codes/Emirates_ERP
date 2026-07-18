package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsInterviewerResponse {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String jobTitle;
    private String mobileNumber;
    private String technology;
    private Long businessUnitId;
    private String businessUnitName;
    private Boolean calendarSyncNotification;
    private String workingHoursStart;
    private String workingHoursEnd;
    private Boolean workingHoursApplyWeekends;
    private Boolean isActive;
    private String createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
