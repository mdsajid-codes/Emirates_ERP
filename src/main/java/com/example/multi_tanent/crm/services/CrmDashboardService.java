package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmDashboardResponse;
import com.example.multi_tanent.crm.dto.CrmDashboardStats;
import com.example.multi_tanent.crm.dto.CrmRecentActivity;
import com.example.multi_tanent.crm.entity.CrmLead;
import com.example.multi_tanent.crm.entity.CrmTask;
import com.example.multi_tanent.crm.repository.*;
import com.example.multi_tanent.sales.entity.Quotation;
import com.example.multi_tanent.sales.enums.SalesStatus;
import com.example.multi_tanent.sales.repository.QuotationRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmDashboardService {

    private final CrmLeadRepository leadRepository;
    private final CrmCompanyRepository companyRepository;
    private final ContactRepository contactRepository;
    private final CrmTaskRepository taskRepository;
    private final QuotationRepository quotationRepository;
    private final TenantRepository tenantRepository;
    private final TenantModuleChecker moduleChecker;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(readOnly = true)
    public CrmDashboardResponse getDashboardSummary() {
        Tenant tenant = currentTenant();
        Long tenantId = tenant.getId();

        // 1. Calculate Stats
        long totalCompanies = companyRepository.countByTenantId(tenantId);
        long totalContacts = contactRepository.countByTenantId(tenantId);
        
        long openDeals = 0;
        BigDecimal totalRevenue = BigDecimal.ZERO;
        boolean salesEnabled = moduleChecker.hasModule(ServiceModule.SALES);

        if (salesEnabled) {
            openDeals = quotationRepository.countByTenantIdAndStatus(tenantId, SalesStatus.SENT);
            List<SalesStatus> revenueStatuses = List.of(SalesStatus.ACCEPTED, SalesStatus.ORDERED);
            BigDecimal totalRevVal = quotationRepository.sumNetTotalByTenantIdAndStatusIn(tenantId, revenueStatuses);
            if (totalRevVal != null) {
                totalRevenue = totalRevVal;
            }
        }

        long pendingTasks = taskRepository.countByTenantIdAndStatusNot(tenantId, "COMPLETED");

        CrmDashboardStats stats = CrmDashboardStats.builder()
                .totalCompanies(totalCompanies)
                .totalContacts(totalContacts)
                .openDeals(openDeals)
                .totalRevenue(totalRevenue.doubleValue())
                .pendingTasks(pendingTasks)
                .build();

        // 2. Aggregate Recent Activity
        List<CrmRecentActivity> activities = new ArrayList<>();

        // Latest Leads
        List<CrmLead> latestLeads = leadRepository.findTop5ByTenantIdOrderByCreatedAtDesc(tenantId);
        for (CrmLead lead : latestLeads) {
            activities.add(CrmRecentActivity.builder()
                    .id(lead.getId())
                    .action("New Lead Created")
                    .target(lead.getFirstName() + " " + (lead.getLastName() != null ? lead.getLastName() : ""))
                    .timestamp(lead.getCreatedAt())
                    .type("LEAD")
                    .build());
        }

        if (salesEnabled) {
            // Latest Quotations (Deals)
            List<Quotation> latestDeals = quotationRepository.findTop5ByTenantIdOrderByCreatedAtDesc(tenantId);
            for (Quotation deal : latestDeals) {
                String action = "Deal Created";
                if (deal.getStatus() == SalesStatus.ACCEPTED || deal.getStatus() == SalesStatus.ORDERED) {
                    action = "Deal Won";
                } else if (deal.getStatus() == SalesStatus.REJECTED || deal.getStatus() == SalesStatus.CANCELLED) {
                    action = "Deal Lost";
                }
                activities.add(CrmRecentActivity.builder()
                        .id(deal.getId())
                        .action(action)
                        .target(deal.getQuotationNumber())
                        .timestamp(deal.getCreatedAt())
                        .type("DEAL")
                        .build());
            }
        }

        // Latest Tasks
        List<CrmTask> latestTasks = taskRepository.findTop5ByTenantIdOrderByCreatedAtDesc(tenantId);
        for (CrmTask task : latestTasks) {
            activities.add(CrmRecentActivity.builder()
                    .id(task.getId())
                    .action(task.getStatus() != null && task.getStatus().equalsIgnoreCase("COMPLETED") ? "Task Completed" : "New Task Created")
                    .target(task.getSubject() != null ? task.getSubject().name() : "No Subject")
                    .timestamp(task.getCreatedAt() != null ? task.getCreatedAt().atOffset(java.time.ZoneOffset.UTC) : null)
                    .type("TASK")
                    .build());
        }

        // Sort by timestamp desc and take top 8
        List<CrmRecentActivity> sortedActivities = activities.stream()
                .sorted(Comparator.comparing(CrmRecentActivity::getTimestamp).reversed())
                .limit(8)
                .collect(Collectors.toList());

        return CrmDashboardResponse.builder()
                .stats(stats)
                .recentActivities(sortedActivities)
                .build();
    }
}
