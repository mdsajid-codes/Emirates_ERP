package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BomSemiFinishedResponse {
    private Long id;
    private ProSemiFinishedResponse item;
    private String bomName;
    private Boolean isLocked;
    private java.math.BigDecimal quantity;
    private ProcessSemiFinishedResponse routing;
    private java.math.BigDecimal approximateCost;
    private Boolean isActive;
    private List<BomSemiFinishedDetailResponse> details;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
