package com.example.multi_tanent.crm.dto;

import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrmDashboardResponse {
    private CrmDashboardStats stats;
    private List<CrmRecentActivity> recentActivities;
}
