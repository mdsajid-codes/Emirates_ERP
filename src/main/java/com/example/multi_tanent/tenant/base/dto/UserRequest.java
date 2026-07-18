package com.example.multi_tanent.tenant.base.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserRequest {
    private String tenantId;
    private String email;
    private String password;    
}
