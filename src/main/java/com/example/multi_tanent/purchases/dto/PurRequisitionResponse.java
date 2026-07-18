package com.example.multi_tanent.purchases.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurRequisitionResponse {
    private Long id;
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
    private LocalDateTime createdAt;
    private List<PurRequisitionItemResponse> items;
}
