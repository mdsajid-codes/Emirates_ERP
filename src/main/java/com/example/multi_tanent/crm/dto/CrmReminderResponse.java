package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.enums.CrmEntityType;
import lombok.*;
import java.time.LocalDateTime;
import java.util.Set;

@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmReminderResponse {
    private Long id;
    private CrmEntityType entityType;
    private Long entityId;
    private String entityTitle;
    private LocalDateTime remindAt;
    private boolean dismissed;
    private Set<String> channels;
    private String recipient;
}
