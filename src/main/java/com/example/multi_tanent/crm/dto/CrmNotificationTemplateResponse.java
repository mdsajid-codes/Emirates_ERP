package com.example.multi_tanent.crm.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

import com.example.multi_tanent.crm.enums.NotificationEvent;
import com.example.multi_tanent.crm.enums.NotificationModule;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmNotificationTemplateResponse {
  private Long id;
  private NotificationModule module;
  private NotificationEvent event;
  private String messageType;
  private String messageBody;

  private boolean bell;
  private boolean email;
  private boolean whatsapp;
  private boolean sms;
  private boolean telegram;
  private boolean screenPopup;
  private String providerTemplateId;

  private boolean active;
  private OffsetDateTime createdAt;
  private OffsetDateTime updatedAt;

  private List<Long> employeeIds;
}

