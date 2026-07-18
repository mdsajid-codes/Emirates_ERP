package com.example.multi_tanent.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AtsVendorDocumentResponse {
    private Long id;
    private Long vendorId;
    private String title;
    private String fileName;
    private String filePath;
    private Long documentTypeId;
    private String documentTypeName;
    private String comments;
}
