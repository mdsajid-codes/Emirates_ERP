package com.example.multi_tanent.pos.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PosAuthRequest {
    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    @NotBlank(message = "Username is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}