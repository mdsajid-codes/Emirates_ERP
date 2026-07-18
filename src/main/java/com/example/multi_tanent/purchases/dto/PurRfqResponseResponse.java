package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRfqResponseResponse {
    private Long id;
    private String responseNumber;
    private Long rfqId;
    private String rfqNumber;
    private LocalDateTime validTill;
    private LocalDateTime submittedAt;

    private List<PurRfqResponseItemResponse> items;
    private List<PurRfqResponseAnswerResponse> answers;
}
