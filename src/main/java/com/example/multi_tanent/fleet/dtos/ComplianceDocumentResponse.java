package com.example.multi_tanent.fleet.dtos;

import lombok.*;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ComplianceDocumentResponse {
    private String entityType;      // VEHICLE | DRIVER
    private Long entityId;
    private String entityName;      // Plate Number or Driver Name
    private String documentType;    // REGISTRATION | INSURANCE | PERMIT | LICENSE | EMIRATES_ID
    private LocalDate expiryDate;
    private Long daysUntilExpiry;
    private String status;          // VALID | EXPIRING_SOON | EXPIRED
}
