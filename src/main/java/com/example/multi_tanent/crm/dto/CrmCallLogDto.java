package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.entity.CrmCallLog;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

@Data
@Builder
public class CrmCallLogDto {
    private Long id;
    private String comments;
    private LocalDate callDate;
    private LocalTime callTime;
    private boolean remindMeBefore;
    private LocalTime reminderTime;

    private Long employeeId;
    private String employeeName;

    private Long leadId;
    private String leadName;

    private Long contactId;
    private String contactName;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static CrmCallLogDto fromEntity(CrmCallLog log) {
        return CrmCallLogDto.builder()
                .id(log.getId())
                .comments(log.getComments())
                .callDate(log.getCallDate())
                .callTime(log.getCallTime())
                .remindMeBefore(log.isRemindMeBefore())
                .reminderTime(log.getReminderTime())
                .employeeId(log.getEmployee() != null ? log.getEmployee().getId() : null)
                .employeeName(log.getEmployee() != null ? log.getEmployee().getFirstName() + " " + log.getEmployee().getLastName() : null)
                .leadId(log.getLead() != null ? log.getLead().getId() : null)
                .leadName(log.getLead() != null ? log.getLead().getFirstName() + " " + log.getLead().getLastName() : null)
                .contactId(log.getContact() != null ? log.getContact().getId() : null)
                .contactName(log.getContact() != null ? log.getContact().getFirstName() + " " + log.getContact().getLastName() : null)
                .createdAt(log.getCreatedAt())
                .updatedAt(log.getUpdatedAt())
                .build();
    }
}