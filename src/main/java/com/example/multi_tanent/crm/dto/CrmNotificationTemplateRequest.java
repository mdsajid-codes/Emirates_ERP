
package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

import com.example.multi_tanent.crm.enums.NotificationEvent;
import com.example.multi_tanent.crm.enums.NotificationModule;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmNotificationTemplateRequest {
  @NotNull private NotificationModule module;
  @NotNull private NotificationEvent event;
  /** Optional label: Welcome, Event Mail, ReAssign Email, etc. */
  private String messageType;

  private String messageBody;

  private boolean bell;
  private boolean email;
  private boolean whatsapp;
  private boolean sms;
  private boolean telegram;
  private boolean screenPopup;

  private String providerTemplateId;

  /** Employee IDs selected in “Notification Employee”. */
  private List<Long> employeeIds;
}
