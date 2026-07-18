package com.example.multi_tanent.fleet.dtos;

import lombok.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerFollowUpResponse {
    private Long id;
    private Long customerId;
    private LocalDate followUpDate;
    private String purpose;
    private String notes;
    private LocalDate nextFollowUpDate;
    private Long assignedToId;
    private String assignedToName;
    private OffsetDateTime createdAt;

    public static CustomerFollowUpResponse fromEntity(com.example.multi_tanent.fleet.entity.CustomerFollowUp followUp) {
        return CustomerFollowUpResponse.builder()
                .id(followUp.getId())
                .customerId(followUp.getCustomer().getId())
                .followUpDate(followUp.getFollowUpDate())
                .purpose(followUp.getPurpose())
                .notes(followUp.getNotes())
                .nextFollowUpDate(followUp.getNextFollowUpDate())
                .assignedToId(followUp.getAssignedTo() != null ? followUp.getAssignedTo().getId() : null)
                .assignedToName(followUp.getAssignedTo() != null ? followUp.getAssignedTo().getName() : "System")
                .createdAt(followUp.getCreatedAt())
                .build();
    }
}
