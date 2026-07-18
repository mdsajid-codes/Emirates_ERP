package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRequestForQuotationResponse {
    private Long id;
    private String rfqNumber;
    private Long tenderingId;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime sentDate;
    private String onlineFormUrl;

    private List<PurRequestForQuotationItemResponse> items;
}
