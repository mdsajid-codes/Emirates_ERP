package com.example.multi_tanent.ats.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsClientAccountResponse {
    private Long id;
    private Long clientId;
    private String clientName;
    private String contactPerson;
    private String mobileNumber;
    private String officeNumber;
    private String officeExtension;
    private String emailId;
    private String designation;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
