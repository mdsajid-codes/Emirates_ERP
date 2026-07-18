package com.example.multi_tanent.crm.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrmDashboardStats {
    private long totalCompanies;
    private long totalContacts;
    private long openDeals;
    private double totalRevenue;
    private long pendingTasks;
}
