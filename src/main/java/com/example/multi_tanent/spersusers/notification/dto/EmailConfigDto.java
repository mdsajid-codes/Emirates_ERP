package com.example.multi_tanent.spersusers.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmailConfigDto {
    private Boolean enabled;
    private String host;
    private Integer port;
    private String username;
    private String password;
    private String fromEmail;
    private String fromName;
    private Boolean sslEnabled;
    private Boolean starttlsEnabled;
}
