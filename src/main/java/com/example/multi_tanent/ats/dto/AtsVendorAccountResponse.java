package com.example.multi_tanent.ats.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorAccountResponse {
    private Long id;
    private String contactPerson;
    private String mobileNumber;
    private String officeNumber;
    private String officeExtension;
    private String emailId;
    private String designation;
    private String paymentTerms;
    private AtsPaymentTermsResponse paymentTerm;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
