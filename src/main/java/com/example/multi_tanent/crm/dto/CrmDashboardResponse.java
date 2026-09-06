package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrmDashboardResponse {
    private CrmDashboardStats stats;
    private CrmPipelineStats pipeline;
    private CrmVelocityStats velocity;
    private List<CrmLeadSourceDistributionDto> leadSources;
    private List<CrmChartDataDto> chartData;
    private List<CrmRecentActivity> recentActivities;
}
