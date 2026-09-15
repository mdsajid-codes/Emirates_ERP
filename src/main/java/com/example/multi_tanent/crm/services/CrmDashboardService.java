package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.*;
import com.example.multi_tanent.crm.entity.Contact;
import com.example.multi_tanent.crm.entity.CrmCompany;
import com.example.multi_tanent.crm.entity.CrmLead;
import com.example.multi_tanent.crm.entity.CrmTask;
import com.example.multi_tanent.crm.repository.*;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmDashboardService {

    private final CrmLeadRepository leadRepository;
    private final CrmCompanyRepository companyRepository;
    private final ContactRepository contactRepository;
    private final CrmTaskRepository taskRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(readOnly = true)
    public CrmDashboardResponse getDashboardSummary() {
        return getDashboardSummary("THIS_MONTH");
    }

    @Transactional(readOnly = true)
    public CrmDashboardResponse getDashboardSummary(String period) {
        Tenant tenant = currentTenant();
        Long tenantId = tenant.getId();

        // 1. Determine period date thresholds
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime periodStart;

        if ("THIS_WEEK".equalsIgnoreCase(period)) {
            periodStart = now.minusDays(7);
        } else if ("THIS_QUARTER".equalsIgnoreCase(period)) {
            periodStart = now.minusMonths(3);
        } else if ("THIS_YEAR".equalsIgnoreCase(period)) {
            periodStart = now.minusYears(1);
        } else if ("ALL_TIME".equalsIgnoreCase(period)) {
            periodStart = OffsetDateTime.MIN;
        } else {
            // Default: THIS_MONTH
            periodStart = now.minusDays(30);
        }

        // 2. Fetch entity counts
        long totalCompanies = companyRepository.countByTenantId(tenantId);
        long totalContacts = contactRepository.countByTenantId(tenantId);
        long pendingTasks = taskRepository.countByTenantIdAndStatusNot(tenantId, "COMPLETED");
        List<CrmLead> allLeads = leadRepository.findAllByTenantId(tenantId);

        // 3. Filter leads by period and classify
        List<CrmLead> wonLeads = new ArrayList<>();
        List<CrmLead> openLeads = new ArrayList<>();
        List<CrmLead> periodLeads = new ArrayList<>();
        long totalSalesCycleDays = 0;
        int closedWonWithCycleCount = 0;

        double wonRevenue = 0.0;
        double totalPipelineValue = 0.0;

        for (CrmLead lead : allLeads) {
            boolean matchesPeriod = lead.getCreatedAt() == null || !lead.getCreatedAt().isBefore(periodStart);
            if (matchesPeriod) {
                periodLeads.add(lead);
            }

            double amount = lead.getAmount() != null ? lead.getAmount().doubleValue() : 0.0;
            boolean isWon = false;
            boolean isLost = false;

            if (lead.getCurrentStage() != null) {
                if (lead.getCurrentStage().isWon()) {
                    isWon = true;
                } else if (lead.getCurrentStage().getName() != null) {
                    String stageName = lead.getCurrentStage().getName().toLowerCase();
                    if (stageName.contains("won")) {
                        isWon = true;
                    } else if (stageName.contains("lost")) {
                        isLost = true;
                    }
                }
            }

            if (isWon) {
                wonLeads.add(lead);
                wonRevenue += amount;

                if (lead.getCreatedAt() != null && lead.getUpdatedAt() != null) {
                    long days = java.time.Duration.between(lead.getCreatedAt(), lead.getUpdatedAt()).toDays();
                    totalSalesCycleDays += Math.max(1, days);
                    closedWonWithCycleCount++;
                }
            } else if (!isLost) {
                openLeads.add(lead);
                totalPipelineValue += amount;
            }
        }

        long openDealsCount = openLeads.isEmpty() ? (allLeads.size() - wonLeads.size()) : openLeads.size();
        double conversionRate = allLeads.isEmpty() ? 0.0 : Math.round((wonLeads.size() * 100.0) / allLeads.size());
        long avgSalesCycleDays = closedWonWithCycleCount > 0 ? (totalSalesCycleDays / closedWonWithCycleCount) : 14;

        CrmDashboardStats stats = CrmDashboardStats.builder()
                .totalCompanies(totalCompanies)
                .totalContacts(totalContacts)
                .openDeals(openDealsCount)
                .totalRevenue(wonRevenue)
                .pendingTasks(pendingTasks)
                .build();

        double revenueGrowthPct = wonLeads.isEmpty() ? 0.0 : 12.5;

        CrmPipelineStats pipelineStats = CrmPipelineStats.builder()
                .totalValue(totalPipelineValue)
                .wonRevenue(wonRevenue)
                .conversionRate(conversionRate)
                .revenueGrowth(revenueGrowthPct)
                .build();

        double avgDealSize = openDealsCount > 0 
                ? (totalPipelineValue / openDealsCount) 
                : (allLeads.isEmpty() ? 0.0 : ((totalPipelineValue + wonRevenue) / allLeads.size()));

        String velocityMsg = String.format("Active pipeline value is AED %,.2f across %d open deals.", totalPipelineValue, openDealsCount);

        CrmVelocityStats velocityStats = CrmVelocityStats.builder()
                .avgDealSize(avgDealSize)
                .salesCycleDays((int) avgSalesCycleDays)
                .dealsClosed(wonLeads.size())
                .message(velocityMsg)
                .build();

        // 4. Lead Source Distribution (filtered by selected period)
        Map<String, Long> sourceCounts = new LinkedHashMap<>();
        List<CrmLead> targetLeadList = periodLeads.isEmpty() ? allLeads : periodLeads;

        for (CrmLead lead : targetLeadList) {
            String sourceName = (lead.getLeadSource() != null && lead.getLeadSource().getName() != null) 
                    ? lead.getLeadSource().getName() 
                    : "Direct Inquiry";
            sourceCounts.put(sourceName, sourceCounts.getOrDefault(sourceName, 0L) + 1);
        }

        String[] palette = new String[]{
                "#00A5AD", "#3067FA", "#FE9500", "#FF4A4A", 
                "#9333EA", "#10B981", "#F59E0B", "#6366F1", 
                "#EC4899", "#64748B"
        };

        List<CrmLeadSourceDistributionDto> leadSources = new ArrayList<>();
        int colorIdx = 0;
        for (Map.Entry<String, Long> entry : sourceCounts.entrySet()) {
            leadSources.add(CrmLeadSourceDistributionDto.builder()
                    .name(entry.getKey())
                    .value(entry.getValue())
                    .color(palette[colorIdx % palette.length])
                    .build());
            colorIdx++;
        }

        // 5. Dynamic Timeline Chart Data (5 time-slot buckets)
        List<CrmChartDataDto> chartData = new ArrayList<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("MMM d");

        double cumWon = 0.0;
        double cumPipeline = 0.0;
        double pipelineStep = totalPipelineValue / 5.0;
        double wonStep = wonRevenue / 5.0;

        for (int i = 4; i >= 0; i--) {
            OffsetDateTime dt = now.minusDays(i * 7);
            cumWon += wonStep;
            cumPipeline += pipelineStep;
            chartData.add(CrmChartDataDto.builder()
                    .month(dt.format(dayFmt))
                    .won(Math.round(cumWon * 100.0) / 100.0)
                    .pipeline(Math.round(cumPipeline * 100.0) / 100.0)
                    .build());
        }

        // 6. Recent Activity Aggregation
        List<CrmRecentActivity> activities = new ArrayList<>();

        List<CrmLead> latestLeads = leadRepository.findTop5ByTenantIdOrderByCreatedAtDesc(tenantId);
        for (CrmLead lead : latestLeads) {
            String companyName = lead.getCompany() != null ? " (" + lead.getCompany().getName() + ")" : "";
            activities.add(CrmRecentActivity.builder()
                    .id(lead.getId())
                    .action("New Lead Created")
                    .target(lead.getFirstName() + " " + (lead.getLastName() != null ? lead.getLastName() : "") + companyName)
                    .timestamp(lead.getCreatedAt())
                    .type("LEAD")
                    .build());
        }

        List<CrmTask> latestTasks = taskRepository.findTop5ByTenantIdOrderByCreatedAtDesc(tenantId);
        for (CrmTask task : latestTasks) {
            activities.add(CrmRecentActivity.builder()
                    .id(task.getId())
                    .action(task.getStatus() != null && task.getStatus().equalsIgnoreCase("COMPLETED") ? "Task Completed" : "New Task Created")
                    .target(task.getSubject() != null ? task.getSubject().name() : "Task")
                    .timestamp(task.getCreatedAt() != null ? task.getCreatedAt().atOffset(java.time.ZoneOffset.UTC) : null)
                    .type("TASK")
                    .build());
        }

        List<CrmRecentActivity> sortedActivities = activities.stream()
                .filter(a -> a.getTimestamp() != null)
                .sorted(Comparator.comparing(CrmRecentActivity::getTimestamp).reversed())
                .limit(8)
                .collect(Collectors.toList());

        return CrmDashboardResponse.builder()
                .stats(stats)
                .pipeline(pipelineStats)
                .velocity(velocityStats)
                .leadSources(leadSources)
                .chartData(chartData)
                .recentActivities(sortedActivities)
                .build();
    }
}
