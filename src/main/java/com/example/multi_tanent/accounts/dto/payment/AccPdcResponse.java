package com.example.multi_tanent.accounts.dto.payment;

import com.example.multi_tanent.accounts.entity.enums.PdcStatus;
import com.example.multi_tanent.accounts.entity.enums.PdcType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class AccPdcResponse {
    private Long id;
    private PdcType pdcType;
    private String chequeNumber;
    private LocalDate chequeDate;
    private BigDecimal amount;
    private Long currencyId;
    private String bankName;
    private Long bankAccountId;
    private Long partnerId;
    private String partnerType;
    private PdcStatus status;
    private Long paymentId;
    private Long step1JournalEntryId;
    private Long step2JournalEntryId;
    private BigDecimal bankCharges;
    private String notes;
    private LocalDateTime clearedAt;
    private String tenantId;
}
