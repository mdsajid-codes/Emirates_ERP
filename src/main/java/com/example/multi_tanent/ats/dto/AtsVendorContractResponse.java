package com.example.multi_tanent.ats.dto;

import com.example.multi_tanent.ats.enums.ContractStatus;
import com.example.multi_tanent.ats.enums.ContractType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsVendorContractResponse {
    private Long id;
    private String contractNumber;
    private ContractType contractType;
    private ContractStatus contractStatus;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate signedDate;
    private String paymentTerms;
    private BigDecimal billRate;
    private BigDecimal payRate;
    private String currency;
    private BigDecimal markupPercent;
    private Boolean autoRenew;
    private String documentUrl;
    private String snapshot;
    private String contractNotes;
    private Long createdById;
    private String createdByName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
