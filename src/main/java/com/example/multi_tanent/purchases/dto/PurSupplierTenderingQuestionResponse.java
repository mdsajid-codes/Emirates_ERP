package com.example.multi_tanent.purchases.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurSupplierTenderingQuestionResponse {
    private Long id;
    private Long questionId;
    private String questionText;
}
