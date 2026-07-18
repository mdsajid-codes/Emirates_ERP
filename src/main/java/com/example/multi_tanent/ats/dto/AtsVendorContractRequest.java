package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.ContractStatus;
import com.example.multi_tanent.ats.enums.ContractType;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorContractRequest {

    @Size(max = 100)
    private String contractNumber;

    private ContractType contractType;

    private ContractStatus contractStatus;

    private LocalDate startDate;

    private LocalDate endDate;

    private LocalDate signedDate;

    @Size(max = 500)
    private String paymentTerms;

    private BigDecimal billRate;

    private BigDecimal payRate;

    @Size(max = 10)
    private String currency;

    private BigDecimal markupPercent;

    private Boolean autoRenew;

    @Size(max = 500)
    private String documentUrl;

    private String snapshot;

    @Size(max = 4000)
    private String contractNotes;
}
