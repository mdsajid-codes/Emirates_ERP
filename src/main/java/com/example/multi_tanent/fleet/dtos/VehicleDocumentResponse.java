package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.VehicleDocumentType;
import lombok.*;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VehicleDocumentResponse {
    private Long id;
    private Long vehicleId;
    private VehicleDocumentType documentType;
    private String filePath;
    private LocalDate expiryDate;
    private OffsetDateTime uploadedAt;
}
