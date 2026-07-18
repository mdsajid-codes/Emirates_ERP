// package com.example.multi_tanent.purchases.dto;

// import lombok.*;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.util.List;

// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class PurGrnResponse {
//     private Long id;
//     private String grnNumber;
//     private LocalDate grnDate;
//     private String remark;
//     private String createdBy;
//     private LocalDateTime createdAt;
//     private Long purchaseOrderId;
//     private String purchaseOrderNumber;
//     private List<PurGrnItemResponse> items;
// }

// PurGrnRequest.java

// PurGrnItemRequest.java

// PurGrnResponse.java
// package com.example.multi_tanent.purchases.dto;

// import lombok.*;
// import java.time.LocalDate;
// import java.time.LocalDateTime;
// import java.util.List;

// @Getter
// @Setter
// @NoArgsConstructor
// @AllArgsConstructor
// @Builder
// public class PurGrnResponse {
//     private Long id;
//     private String grnNumber;
//     private LocalDate grnDate;
//     private Long purchaseOrderId;
//     private String remark;
//     private String createdBy;
//     private LocalDateTime createdAt;
//     private List<PurGrnItemResponse> items;
// }

// // PurGrnItemResponse.java

// src/main/java/com/example/multi_tanent/purchases/dto/PurGrnResponse.java
package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurGrnResponse {
    private Long id;
    private String grnNumber;
    private LocalDate grnDate;
    private Long purchaseOrderId;
    private String remark;
    private String createdBy;
    private LocalDateTime createdAt;
    private List<PurGrnItemResponse> items;
}
