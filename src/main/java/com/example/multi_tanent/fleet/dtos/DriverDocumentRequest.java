package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.DriverDocumentType;
import lombok.*;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DriverDocumentRequest {
    private DriverDocumentType documentType;
    private String documentNumber;
    private LocalDate expiryDate;
    private String filePath;
}
