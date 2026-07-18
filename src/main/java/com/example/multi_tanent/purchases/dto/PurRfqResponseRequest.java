package com.example.multi_tanent.purchases.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurRfqResponseRequest {
    private LocalDateTime validTill;

    private List<PurRfqResponseItemRequest> items;
    private List<PurRfqResponseAnswerRequest> answers;
}
