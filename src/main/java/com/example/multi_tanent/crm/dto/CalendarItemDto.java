package com.example.multi_tanent.crm.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CalendarItemDto {
    private Long id;
    private String type;        // "TASK" | "EVENT"
    private String title;       // task subject or event subject
    private String description;
    private LocalDate date;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private String priority;
    private String leadName;    // if linked to a lead
    private Long reminderId;    // if a reminder exists
    private LocalDateTime remindAt;
    private boolean reminderDismissed;
}
