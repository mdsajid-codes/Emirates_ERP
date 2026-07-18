package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.entity.CrmEmail;
import com.example.multi_tanent.crm.enums.EmailStatus;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class CrmEmailDto {
    private Long id;
    private String fromAddress;
    private String toAddress;
    private String ccAddress;
    private String subject;
    private String body;
    private EmailStatus status;
    private Long leadId;
    private Long contactId;
    private Long sentByEmployeeId;
    private String sentByEmployeeName;
    private OffsetDateTime createdAt;

    public static CrmEmailDto fromEntity(CrmEmail email) {
        return CrmEmailDto.builder()
                .id(email.getId())
                .fromAddress(email.getFromAddress())
                .toAddress(email.getToAddress())
                .ccAddress(email.getCcAddress())
                .subject(email.getSubject())
                .body(email.getBody())
                .status(email.getStatus())
                .leadId(email.getLead() != null ? email.getLead().getId() : null)
                .contactId(email.getContact() != null ? email.getContact().getId() : null)
                .sentByEmployeeId(email.getSentBy() != null ? email.getSentBy().getId() : null)
                .sentByEmployeeName(email.getSentBy() != null ? email.getSentBy().getFirstName() + " " + email.getSentBy().getLastName() : null)
                .createdAt(email.getCreatedAt())
                .build();
    }
}