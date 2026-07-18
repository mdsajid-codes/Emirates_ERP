package com.example.multi_tanent.master.dto;

import com.example.multi_tanent.master.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class MasterUserRequest {
    @NotBlank(message = "Username is required")
    private String username;

    private String password; // Not blank on create, optional on update

    @NotEmpty(message = "At least one role is required")
    private Set<Role> roles;
}