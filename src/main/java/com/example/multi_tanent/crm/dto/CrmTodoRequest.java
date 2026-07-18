package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.enums.TaskSubject;
import com.example.multi_tanent.crm.enums.TodoPriority;
import com.example.multi_tanent.crm.enums.TodoStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTodoRequest {
    private TaskSubject subject;          // required by UI
    private String description;

    private LocalDate dueDate;
    private LocalTime fromTime;
    private LocalTime toTime;

    private TodoStatus status;            // OPEN/COMPLETED/...
    private TodoPriority priority;        // LOW/NORMAL/HIGH

    private String customerContactName;

    private Long assignedToEmployeeId;    // optional primary assignee
    private Set<Long> employeeIds;        // participants
    private Set<Long> contactIds;         // related contacts
    private Set<Long> labelIds;           // labels
}

