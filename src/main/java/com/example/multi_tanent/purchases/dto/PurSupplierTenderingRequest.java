package com.example.multi_tanent.purchases.dto;

import com.example.multi_tanent.purchases.enums.PurTenderingStatus;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingRequest {

    private String transactionType;
    private String initiatedBy;
    private LocalDate requiredDate;
    private String project;
    private String entity; // entityName
    private String tenderingCurrency;

    // Polymorphic Basis (Sales Order, Quotation, Requisition)
    private String basisType;
    private Long basisId;

    private Long warehouseId;

    private PurTenderingStatus status;

    private List<PurSupplierTenderingItemRequest> items;
    private List<PurSupplierTenderingSupplierRequest> suppliers;
    private List<PurSupplierTenderingQuestionRequest> questions;
}
