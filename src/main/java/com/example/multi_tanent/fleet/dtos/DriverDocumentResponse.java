package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.DriverDocumentType;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverDocumentResponse {
    private Long id;
    private Long driverId;
    private DriverDocumentType documentType;
    private String filePath;
    private String documentNumber;
    private LocalDate expiryDate;
    private OffsetDateTime uploadedAt;
}
