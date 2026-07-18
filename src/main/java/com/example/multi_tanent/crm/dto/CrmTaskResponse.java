package com.example.multi_tanent.crm.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;


import com.example.multi_tanent.crm.enums.TaskSubject;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTaskResponse {
    private Long id;
    private Long tenantId;

    private TaskSubject subject;
    private String comments;
    private LocalDate dueDate;
    private LocalTime callTime;

    private Long assignedToId;
    private String assignedToName;

    private List<SimpleIdNameDto> employees; // id + name
    private List<SimpleIdNameDto> contacts;  // id + name

    private Long leadId;

    private String status;
    private String createdAt;
    private String updatedAt;
}
