package com.example.multi_tanent.spersusers.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class OtherPersonRequest {
    private Long partyId;

    @Size(max = 255)
    private String salutation;
    @Size(max = 255)
    private String firstName;
    @Size(max = 255)
    private String lastName;
    @Email
    private String emailAddress;
    private String workPhone;
    private String mobile;
    private String skypeNameOrNumber;
    private String designation;
    private String department;
}