package com.example.multi_tanent.spersusers.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookEndpointDto {
    private Long id;
    private String name;
    private String url;
    private String secret;
    private String templateId;
    private String httpMethod;
    private String customHeaders;
    private Boolean active;
}
