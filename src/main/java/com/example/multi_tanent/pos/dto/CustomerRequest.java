package com.example.multi_tanent.pos.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomerRequest {
    @NotBlank(message = "Customer name is required")
    private String name;

    private String phone;

    @Email(message = "Please provide a valid email address")
    private String email;
}