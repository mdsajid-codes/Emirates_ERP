package com.example.multi_tanent.crm.dto;


import com.example.multi_tanent.crm.enums.NotificationModule;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmNotificationModuleSettingRequest {
  @NotNull private NotificationModule module;
  private boolean metaResponseEnabled;
}
