package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.TaskPriority;
import com.example.multi_tanent.ats.enums.TaskStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorTaskResponse {
    private Long id;
    private String taskTitle;
    private String taskDescription;
    private TaskStatus taskStatus;
    private TaskPriority priority;
    private LocalDate dueDate;
    private Long assignedToId;
    private String assignedToName;
    private String taskType;
    private String taskCategory;
    private Long escalateToId;
    private String escalateToName;
    private Long ownershipId;
    private String ownershipName;
    private String reminder;
    private String meetingLink;
    private OffsetDateTime completedAt;
    private Long createdById;
    private String createdByName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
