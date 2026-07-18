package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingSupplierResponse {
    private Long id;
    private Long supplierId;
    private String supplierName;
    private String contractType;
    private String contactPerson;
    private String email;

    // We can also include the rfqNumber or responseNumber if needed for the UI table
    private String rfqNumber;
    private String rfqOnlineUrl;
    private String responseNumber;

    private List<PurSupplierTenderingSupplierItemResponse> supplierItems;
}
