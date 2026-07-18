package com.example.multi_tanent.spersusers.dto;

import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.util.Set;

@Data
@Builder
public class NotificationRequest {
    private String recipient;
    private String subject;
    private String body;
    private Set<String> channels;
    private String templateId; // Added for dynamic lookup

    private Map<String, Object> metadata;
    private Long tenantId;

    private String referenceType;
    private Long referenceId;

    private java.util.List<String> attachmentPaths;
}