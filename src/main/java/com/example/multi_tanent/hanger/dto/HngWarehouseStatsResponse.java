package com.example.multi_tanent.hanger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngWarehouseStatsResponse {
    private long totalFgStock;
    private long cartonsPackedToday;
    private long activeProductionBatches;
    private long pendingDeliveries;
}
