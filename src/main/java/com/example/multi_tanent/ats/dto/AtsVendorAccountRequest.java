package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorAccountRequest {

    @Size(max = 150)
    private String contactPerson;

    @Size(max = 30)
    private String mobileNumber;

    @Size(max = 30)
    private String officeNumber;

    @Size(max = 10)
    private String officeExtension;

    @Size(max = 150)
    private String emailId;

    @Size(max = 100)
    private String designation;

    @Size(max = 200)
    private String paymentTerms;

    private Long paymentTermId;
}
