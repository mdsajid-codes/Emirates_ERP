package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.TaskPriority;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorNoteResponse {
    private Long id;
    private String noteTitle;
    private String noteBody;
    private Long actionId;
    private String actionName;
    private TaskPriority notesPriority;
    private String noteHeader;
    private Boolean remindMe;
    private List<EmployeeRef> notifyPeople;
    private Boolean isPinned;
    private Long createdById;
    private String createdByName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EmployeeRef {
        private Long id;
        private String name;
    }
}
