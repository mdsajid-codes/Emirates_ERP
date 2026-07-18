package com.example.multi_tanent.production.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ProTaskRequest {

    @NotBlank(message = "Task name is required.")
    @Size(max = 255)
    private String name;

    private String description;
    private Long locationId; // Optional
}