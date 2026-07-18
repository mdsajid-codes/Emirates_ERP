package com.example.multi_tanent.spersusers.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WhatsAppTemplateDto {
    private Long id;
    private String templateId;
    private String name;
    private String body;
    private String providerTemplateId;
    private String languageCode;
    private Boolean active;
}
