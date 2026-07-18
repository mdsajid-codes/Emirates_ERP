// package com.example.multi_tanent.purchases.dto;

// import java.time.LocalDateTime;

// import lombok.AllArgsConstructor;
// import lombok.Builder;
// import lombok.Getter;
// import lombok.NoArgsConstructor;
// import lombok.Setter;

// @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
// public class PurPurchaseOrderAttachmentResponse {
//     private Long id;
//     private String fileName;
//     private String filePath;
//     private String uploadedBy;
//     private LocalDateTime uploadedAt;
// }

package com.example.multi_tanent.purchases.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurPurchaseOrderAttachmentResponse {
    private Long id;
    private String fileName;
    private String filePath; // relative path stored in DB e.g. "purchase_orders/123/file.png"
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private String url; // public URL e.g. "http://host/uploads/tenantId/purchase_orders/123/file.png"
}
