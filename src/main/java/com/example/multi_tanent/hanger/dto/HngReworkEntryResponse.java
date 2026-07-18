package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.BatchStage;
import lombok.*;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HngReworkEntryResponse {
    private Long id;
    private Long batchId;
    private String batchNo;
    private String reworkNo;
    private BatchStage sourceStage;
    private BatchStage targetStage;
    private Integer reworkQty;
    private String reason;
    private String remarks;
    private String status;
    private String assignedToName;
    private OffsetDateTime createdAt;
}
