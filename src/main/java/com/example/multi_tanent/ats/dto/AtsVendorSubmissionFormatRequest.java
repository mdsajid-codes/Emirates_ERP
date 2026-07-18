package com.example.multi_tanent.ats.dto;

import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorSubmissionFormatRequest {

    @Size(max = 250)
    private String submissionDescription;

    @Size(max = 250)
    private String mailDescription;

    @Size(max = 300)
    private String mailingSubject;

    private String body;
}
