package com.example.multi_tanent.crm.dto;


import com.example.multi_tanent.crm.enums.NotificationModule;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmNotificationModuleSettingResponse {
  private Long id;
  private NotificationModule module;
  private boolean metaResponseEnabled;
}
