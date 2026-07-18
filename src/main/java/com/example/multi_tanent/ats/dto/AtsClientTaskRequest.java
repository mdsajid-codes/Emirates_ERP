package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.TaskPriority;
import com.example.multi_tanent.ats.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientTaskRequest {

    @NotBlank(message = "Task title is required")
    @Size(max = 300)
    private String taskTitle;

    @Size(max = 2000)
    private String taskDescription;

    private TaskStatus taskStatus;

    private TaskPriority priority;

    private LocalDate dueDate;

    private Long assignedToId;

    private String taskType;

    private String taskCategory;

    private Long escalateToId;

    private Long ownershipId;

    private String reminder;

    private String meetingLink;
}
