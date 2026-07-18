package com.example.multi_tanent.spersusers.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelegramConfigDto {
    private Boolean enabled;
    private String botToken;
    private String defaultChatId;
}
