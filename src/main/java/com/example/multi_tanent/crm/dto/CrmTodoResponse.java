package com.example.multi_tanent.crm.dto;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

import com.example.multi_tanent.crm.enums.TaskSubject;
import com.example.multi_tanent.crm.enums.TodoPriority;
import com.example.multi_tanent.crm.enums.TodoStatus;

import java.util.List;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTodoResponse {
    private Long id;

    private TaskSubject subject;
    private String description;

    private LocalDate dueDate;
    private LocalTime fromTime;
    private LocalTime toTime;

    private TodoStatus status;
    private TodoPriority priority;

    private String customerContactName;

    private Long assignedToId;
    private String assignedToName;

    private List<SimpleIdNameDto> employees;
    private List<SimpleIdNameDto> contacts;
    private List<SimpleIdNameDto> labels;

    private String createdAt;
    private String updatedAt;
}
