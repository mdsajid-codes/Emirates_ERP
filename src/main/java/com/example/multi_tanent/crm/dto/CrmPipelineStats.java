package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrmPipelineStats {
    private double totalValue;
    private double wonRevenue;
    private double conversionRate;
    private double revenueGrowth;
}
