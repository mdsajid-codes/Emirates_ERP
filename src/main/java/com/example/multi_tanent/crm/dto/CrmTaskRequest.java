package com.example.multi_tanent.crm.dto;



import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import com.example.multi_tanent.crm.enums.TaskSubject;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTaskRequest {
    @NotNull
    private TaskSubject subject;

    private String comments;

    // Expect "yyyy-MM-dd" (UI datepicker)
    private LocalDate dueDate;

    // Expect "HH:mm" 24h string converted to LocalTime by Jackson
    private LocalTime callTime;

    // Single primary assignee
    private Long assignedToEmployeeId;

    // Multi-selects
    private Set<Long> employeeIds;
    private Set<Long> contactIds;

    // Link to lead
    private Long leadId;

    // Optional status (e.g., "OPEN", "DONE")
    private String status;
}
