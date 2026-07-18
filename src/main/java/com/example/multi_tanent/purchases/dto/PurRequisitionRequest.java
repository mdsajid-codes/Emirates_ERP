package com.example.multi_tanent.purchases.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurRequisitionRequest {
    private String requisitionNumber;
    private LocalDate requisitionDate;
    private String requestedBy;
    private String recipient;
    private LocalDate requiredDate;
    private String entity;
    private String status;
    private String basis;
    private String comment;
    private String createdBy;
    private List<PurRequisitionItemRequest> items;
}
