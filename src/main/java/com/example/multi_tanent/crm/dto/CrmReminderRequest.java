package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.enums.CrmEntityType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmReminderRequest {
    private CrmEntityType entityType;
    private Long entityId;
    private LocalDateTime remindAt;
    private Set<String> channels;
    private String recipient;
}
