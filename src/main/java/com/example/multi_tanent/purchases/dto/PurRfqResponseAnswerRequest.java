package com.example.multi_tanent.purchases.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRfqResponseAnswerRequest {
    private Long questionId; // ID of PurSupplierTenderingQuestion
    private String answer;
}
