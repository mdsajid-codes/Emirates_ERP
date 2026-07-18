package com.example.multi_tanent.crm.dto;



import com.example.multi_tanent.crm.enums.TaskSubject;
import com.example.multi_tanent.crm.enums.TodoPriority;
import com.example.multi_tanent.crm.enums.TodoStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.Set;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTodoFilterRequest {

    public enum DateMode {
        TODAY, NEXT_DAY, NEXT_WEEK, LAST_2_WEEKS, SHOW_ALL, CUSTOM
    }

    public enum SortBy {
        DUE_DATE, CREATED_DATE, UPDATED_DATE
    }

    public enum Direction {
        ASC, DESC
    }

    private DateMode dateMode = DateMode.SHOW_ALL;
    private LocalDate fromDate;      // used when CUSTOM
    private LocalDate toDate;        // used when CUSTOM

    private TodoPriority priority;   // null = All
    private TodoStatus status;       // null = All
    private TaskSubject subject;     // null = All

    private Long labelId;            // null = All labels

    private SortBy sortBy = SortBy.CREATED_DATE;
    private Direction direction = Direction.DESC;

    private Set<Long> employeeIds;   // optional: filter by participants/assignee
}
