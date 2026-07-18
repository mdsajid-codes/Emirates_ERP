package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingSupplierRequest {
    private Long supplierId;
    private String supplierName;
    private String contractType;
    private String contactPerson;
    private String email;

    private List<PurSupplierTenderingSupplierItemRequest> supplierItems;
}
