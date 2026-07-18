package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class CrmEmailRequestDto {

    private Long leadId;
    private Long contactId;
    private Long sentByEmployeeId; // For internal tracking

    @NotEmpty(message = "Subject cannot be empty.")
    private String subject;

    @NotEmpty(message = "Email body cannot be empty.")
    private String body;

    private String ccAddress;
}