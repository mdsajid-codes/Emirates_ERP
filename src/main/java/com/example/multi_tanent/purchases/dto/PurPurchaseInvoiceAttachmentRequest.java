package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PurPurchaseInvoiceAttachmentRequest {
    private String fileName;
    private String filePath;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
}
