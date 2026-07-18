package com.example.multi_tanent.spersusers.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CustomFieldRequest {
    private Long partyId;

    @NotBlank(message = "Field name is required.")
    private String fieldName;

    private String fieldValue;
}