package com.example.multi_tanent.purchases.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingQuestionRequest {
    private Long questionId; // ID of master question
    private String questionText;
}
