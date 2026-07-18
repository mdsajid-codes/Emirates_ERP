package com.example.multi_tanent.crm.dto;

import lombok.*;
import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrmRecentActivity {
    private Long id;
    private String action;
    private String target;
    private OffsetDateTime timestamp;
    private String type; // e.g., "LEAD", "DEAL", "TASK", "EVENT"
}
