package com.example.multi_tanent.spersusers.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SmsConfigDto {
    private Boolean enabled;
    private String provider;
    private String apiKey;
    private String apiSecret;
    private String senderId;
}
