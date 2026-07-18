package com.example.multi_tanent.spersusers.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailTemplateDto {
    private Long id;
    private String templateId;
    private String name;
    private String subject;
    private String body;
    private Boolean active;
    private String languageCode;
}
