package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessSemiFinishedResponse {
    private Long id;
    private Long itemId;
    private String itemName;
    private String processFlowName;
    private BigDecimal otherFixedCost;
    private BigDecimal otherVariableCost;
    private boolean isLocked;
    private List<ProcessSemiFinishedDetailResponse> details;
    private Long locationId;
    private String locationName;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static ProcessSemiFinishedResponse fromEntity(
            com.example.multi_tanent.production.entity.ProcessSemiFinished entity) {
        if (entity == null) {
            return null;
        }
        return ProcessSemiFinishedResponse.builder()
                .id(entity.getId())
                .itemId(entity.getItem() != null ? entity.getItem().getId() : null)
                .itemName(entity.getItem() != null ? entity.getItem().getName() : null)
                .processFlowName(entity.getProcessFlowName())
                .otherFixedCost(entity.getOtherFixedCost())
                .otherVariableCost(entity.getOtherVariableCost())
                .isLocked(entity.isLocked())
                // We'll skip mapping details for now to avoid deep recursion or if detail DTO
                // doesn't have fromEntity
                // Or we can map if we are sure. Let's map empty list or null for now to be
                // safe,
                // or map if we have ProcessSemiFinishedDetailResponse.fromEntity
                // Checking usage: Bom service just needs reference mostly.
                // But let's check if we can stream map.
                // .details(entity.getDetails().stream().map(ProcessSemiFinishedDetailResponse::fromEntity).collect(Collectors.toList()))
                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
