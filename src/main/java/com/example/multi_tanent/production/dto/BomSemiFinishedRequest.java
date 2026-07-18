package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BomSemiFinishedRequest {
    private Long itemId;
    private String bomName;
    private Boolean isLocked;
    private java.math.BigDecimal quantity;
    private Long routingId;
    private java.math.BigDecimal approximateCost;
    private Boolean isActive;
    private List<BomSemiFinishedDetailRequest> details;
}
