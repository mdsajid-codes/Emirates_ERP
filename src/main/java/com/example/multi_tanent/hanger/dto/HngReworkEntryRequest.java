package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.BatchStage;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HngReworkEntryRequest {
    @NotNull(message = "Batch ID is required")
    private Long batchId;

    @NotNull(message = "Source stage is required")
    private BatchStage sourceStage;

    @NotNull(message = "Target stage is required")
    private BatchStage targetStage;

    @NotNull(message = "Rework quantity is required")
    private Integer reworkQty;

    private String reason;
    private String remarks;
    private Long assignedToId;
}
