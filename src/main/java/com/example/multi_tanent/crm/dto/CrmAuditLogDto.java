package com.example.multi_tanent.crm.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmAuditLogDto {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String description;
    private String performedBy;
    private OffsetDateTime performedAt;
}
