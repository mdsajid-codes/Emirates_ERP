package com.example.multi_tanent.crm.dto;



import com.example.multi_tanent.crm.enums.TaskSubject;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmTodoSubjectCount {
    private TaskSubject subject;
    private long count;
}

