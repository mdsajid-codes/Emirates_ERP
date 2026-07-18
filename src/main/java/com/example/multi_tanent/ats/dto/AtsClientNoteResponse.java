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
public class AtsClientNoteResponse {
    private Long id;
    private Long clientId;
    private String clientName;
    private Long actionId;
    private String actionName;
    private TaskPriority notesPriority;
    private String noteBody;
    private Boolean remindMe;
    private Long createdById;
    private String createdByName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private List<NotifyUserRef> notifyPeople;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class NotifyUserRef {
        private Long id;
        private String name;
    }
}
