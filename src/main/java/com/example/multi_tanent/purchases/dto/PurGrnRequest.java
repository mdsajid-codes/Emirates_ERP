package com.example.multi_tanent.purchases.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurGrnRequest {
    private Long purchaseOrderId;
    private String grnNumber;
    private LocalDate grnDate;
    private String remark;
    private String createdBy;
    private List<PurGrnItemRequest> items;
}
