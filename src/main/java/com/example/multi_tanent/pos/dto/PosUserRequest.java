package com.example.multi_tanent.pos.dto;

import com.example.multi_tanent.pos.enums.PosRole;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PosUserRequest {
    @NotBlank(message = "Username is required")
    private String email;

    private String displayName;

    @Size(min = 6, message = "Password must be at least 6 characters long")
    private String password; // Not required for updates

    @NotEmpty(message = "Role is required")
    private PosRole role; // e.g., CASHIER, MANAGER, ADMIN

    private Long storeId; // Optional: assign user to a specific store
}