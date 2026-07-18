package com.example.multi_tanent.purchases.dto;

import com.example.multi_tanent.purchases.enums.PurTenderingStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingResponse {
    private Long id;
    private String tenderNumber;
    private PurTenderingStatus status;
    private String transactionType;
    private String initiatedBy;
    private LocalDate requiredDate;
    private String project;
    private String entity;
    private String tenderingCurrency;
    private String basisType;
    private Long basisId;
    private Long warehouseId;
    private String createdBy;
    private LocalDateTime createdAt;

    private List<PurSupplierTenderingItemResponse> items;
    private List<PurSupplierTenderingSupplierResponse> suppliers;
    private List<PurSupplierTenderingQuestionResponse> questions;
}
