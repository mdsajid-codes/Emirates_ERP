package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientAccountRequest {

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotBlank(message = "Contact person is required")
    @Size(max = 150, message = "Contact person cannot exceed 150 characters")
    private String contactPerson;

    @Size(max = 30, message = "Mobile number cannot exceed 30 characters")
    private String mobileNumber;

    @Size(max = 30, message = "Office number cannot exceed 30 characters")
    private String officeNumber;

    @Size(max = 10, message = "Office extension cannot exceed 10 characters")
    private String officeExtension;

    @Email(message = "Email ID must be a valid email address")
    @Size(max = 150, message = "Email ID cannot exceed 150 characters")
    private String emailId;

    @Size(max = 100, message = "Designation cannot exceed 100 characters")
    private String designation;
}
