package com.example.multi_tanent.production.services;

import com.example.multi_tanent.hanger.enums.BatchStage;
import com.example.multi_tanent.hanger.repository.HngProductionBatchRepository;
import com.example.multi_tanent.production.dto.ProductionDashboardDto;
import com.example.multi_tanent.production.entity.ManufacturingOrder;
import com.example.multi_tanent.production.entity.ProFinishedGood;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.enums.ManufacturingOrderStatus;
import com.example.multi_tanent.production.repository.ManufacturingOrderRepository;
import com.example.multi_tanent.production.repository.ProFinishedGoodRepository;
import com.example.multi_tanent.production.repository.ProRawMaterialsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductionDashboardService {

        private final ManufacturingOrderRepository moRepository;
        private final ProFinishedGoodRepository fgRepository;
        private final ProRawMaterialsRepository rmRepository;
        private final HngProductionBatchRepository batchRepository;

        private static final List<ManufacturingOrderStatus> TERMINAL_STATUSES = List
                        .of(ManufacturingOrderStatus.COMPLETED, ManufacturingOrderStatus.CANCELLED);

        @Transactional(readOnly = true)
        public ProductionDashboardDto getDashboardStats(Long tenantId, boolean isHangerTenant,
                        OffsetDateTime from, OffsetDateTime to) {
                ProductionDashboardDto.ProductionDashboardDtoBuilder builder = ProductionDashboardDto.builder();
                OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

                // 1. MO Stats (date-scoped)
                List<Object[]> moStatusCounts = moRepository.countByStatusForTenantBetween(tenantId, from, to);
                ProductionDashboardDto.MoStats moStats = new ProductionDashboardDto.MoStats();
                moStats.setTotal(moRepository.countByTenantId(tenantId));
                for (Object[] row : moStatusCounts) {
                        ManufacturingOrderStatus status = (ManufacturingOrderStatus) row[0];
                        long count = (long) row[1];
                        if (status == ManufacturingOrderStatus.SCHEDULED)
                                moStats.setScheduled(count);
                        else if (status == ManufacturingOrderStatus.IN_PROGRESS)
                                moStats.setInProgress(count);
                        else if (status == ManufacturingOrderStatus.COMPLETED)
                                moStats.setCompleted(count);
                        else if (status == ManufacturingOrderStatus.CANCELLED)
                                moStats.setCancelled(count);
                }
                builder.moStats(moStats);

                // 2. FG Stock Value
                List<ProFinishedGood> fgs = fgRepository.findByTenantId(tenantId);
                BigDecimal totalFgValue = fgs.stream().map(fg -> {
                        BigDecimal qty = fg.getStockQuantity() != null ? fg.getStockQuantity() : BigDecimal.ZERO;
                        BigDecimal price = fg.getSalesPrice() != null ? fg.getSalesPrice() : BigDecimal.ZERO;
                        return qty.multiply(price);
                }).reduce(BigDecimal.ZERO, BigDecimal::add);
                builder.fgStockValue(totalFgValue);

                // 3. Raw Material Alerts
                List<ProRawMaterials> rms = rmRepository.findByTenantId(tenantId);
                List<ProductionDashboardDto.LowStockMaterial> lowStock = rms.stream().filter(rm -> {
                        BigDecimal qty = rm.getStockQuantity() != null ? rm.getStockQuantity() : BigDecimal.ZERO;
                        BigDecimal limit = rm.getReorderLimit() != null ? rm.getReorderLimit() : BigDecimal.ZERO;
                        return qty.compareTo(limit) < 0;
                }).map(rm -> ProductionDashboardDto.LowStockMaterial.builder()
                                .name(rm.getName())
                                .stockQuantity(rm.getStockQuantity() != null ? rm.getStockQuantity() : BigDecimal.ZERO)
                                .reorderLimit(rm.getReorderLimit() != null ? rm.getReorderLimit() : BigDecimal.ZERO)
                                .build()).collect(Collectors.toList());
                builder.rawMaterialAlerts(lowStock.size());
                builder.lowStockMaterials(lowStock);

                // 4. Monthly Output Mock
                builder.monthlyOutput(List.of(
                                new ProductionDashboardDto.MonthlyOutput("Jan", new BigDecimal("5000"),
                                                new BigDecimal("4800")),
                                new ProductionDashboardDto.MonthlyOutput("Feb", new BigDecimal("6000"),
                                                new BigDecimal("6200")),
                                new ProductionDashboardDto.MonthlyOutput("Mar", new BigDecimal("5500"),
                                                new BigDecimal("5300"))));

                // 5. Delivery Performance Mock
                builder.deliveryTrend(List.of(
                                new ProductionDashboardDto.DeliveryPerformance("Jan", 14, 2),
                                new ProductionDashboardDto.DeliveryPerformance("Feb", 18, 3),
                                new ProductionDashboardDto.DeliveryPerformance("Mar", 12, 1)));

                // 6. Top Finished Goods
                builder.topFinishedGoods(fgs.stream().sorted((a, b) -> {
                        BigDecimal qtyA = a.getStockQuantity() != null ? a.getStockQuantity() : BigDecimal.ZERO;
                        BigDecimal qtyB = b.getStockQuantity() != null ? b.getStockQuantity() : BigDecimal.ZERO;
                        return qtyB.compareTo(qtyA);
                }).limit(5).map(fg -> ProductionDashboardDto.TopFinishedGood.builder()
                                .name(fg.getName())
                                .quantity(fg.getStockQuantity() != null ? fg.getStockQuantity() : BigDecimal.ZERO)
                                .build()).collect(Collectors.toList()));

                // 7. Recent MOs
                builder.recentMos(moRepository.findTop5ByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(0, 5))
                                .stream().map(mo -> toRecentMo(mo)).collect(Collectors.toList()));

                // 8. Upcoming MOs (next 7 days)
                OffsetDateTime sevenDaysLater = now.plusDays(7);
                builder.upcomingMos(moRepository.findUpcomingMos(tenantId, now, sevenDaysLater, TERMINAL_STATUSES)
                                .stream().limit(8).map(mo -> toRecentMo(mo)).collect(Collectors.toList()));

                // 9. Employee Workload
                List<Object[]> workloadRaw = moRepository.countActiveMosByAssignee(tenantId);
                builder.workloadSummary(workloadRaw.stream()
                                .map(row -> ProductionDashboardDto.EmployeeWorkload.builder()
                                                .name((String) row[0])
                                                .moCount((long) row[1])
                                                .build())
                                .collect(Collectors.toList()));

                // 10. Alerts
                List<ProductionDashboardDto.AlertItem> alerts = new ArrayList<>();
                moRepository.findOverdueMos(tenantId, now, TERMINAL_STATUSES).stream().limit(5)
                                .forEach(mo -> alerts.add(ProductionDashboardDto.AlertItem.builder()
                                                .type("OVERDUE_MO")
                                                .message("MO #" + mo.getMoNumber() + " is overdue (due "
                                                                + (mo.getDueDate() != null
                                                                                ? mo.getDueDate().toLocalDate()
                                                                                : "N/A")
                                                                + ")")
                                                .severity("HIGH")
                                                .href("/production-dashboard/manage-manufacturing-order")
                                                .build()));
                lowStock.stream()
                                .filter(m -> m.getStockQuantity()
                                                .compareTo(m.getReorderLimit().multiply(new BigDecimal("0.5"))) < 0)
                                .forEach(m -> alerts.add(ProductionDashboardDto.AlertItem.builder()
                                                .type("CRITICAL_STOCK")
                                                .message("Critical stock: " + m.getName() + " has only "
                                                                + m.getStockQuantity() + " units left")
                                                .severity("MEDIUM")
                                                .href("/production-settings?tab=Raw+Materials")
                                                .build()));
                builder.alerts(alerts);

                // 11. Hanger-specific
                if (isHangerTenant) {
                        List<Object[]> stageCounts = batchRepository.countByStageForTenant(tenantId);
                        Map<String, Long> pipeline = new LinkedHashMap<>();
                        for (BatchStage stage : BatchStage.values())
                                pipeline.put(stage.name(), 0L);
                        for (Object[] row : stageCounts) {
                                BatchStage stage = (BatchStage) row[0];
                                pipeline.put(stage.name(), (long) row[1]);
                        }
                        builder.hangerBatchPipeline(pipeline);

                        builder.recentBatches(batchRepository
                                        .findTop5ByTenantIdOrderByCreatedAtDesc(tenantId, PageRequest.of(0, 5))
                                        .stream().map(batch -> ProductionDashboardDto.RecentBatch.builder()
                                                        .id(batch.getId())
                                                        .batchNo(batch.getBatchNo())
                                                        .hangerTypeName(batch.getHangerType() != null
                                                                        ? batch.getHangerType().getTypeName().getLabel()
                                                                        : "N/A")
                                                        .stage(batch.getCurrentStage().getLabel())
                                                        .status(batch.getStatus().getLabel())
                                                        .build())
                                        .collect(Collectors.toList()));

                        builder.qcPassRates(ProductionDashboardDto.QcPassRates.builder().pass(85).conditionalPass(10)
                                        .fail(5).build());
                        builder.scrapRateTrend(List.of(
                                        new ProductionDashboardDto.ScrapRateData("Jan", 2.1),
                                        new ProductionDashboardDto.ScrapRateData("Feb", 1.8),
                                        new ProductionDashboardDto.ScrapRateData("Mar", 2.3)));
                }

                return builder.build();
        }

        private ProductionDashboardDto.RecentMo toRecentMo(ManufacturingOrder mo) {
                String itemName = mo.getItem() != null ? mo.getItem().getName()
                                : (mo.getProFinishedGood() != null ? mo.getProFinishedGood().getName() : "N/A");
                return ProductionDashboardDto.RecentMo.builder()
                                .id(mo.getId())
                                .moNumber(mo.getMoNumber())
                                .itemName(itemName)
                                .status(mo.getStatus())
                                .quantity(mo.getQuantity())
                                .dueDate(mo.getDueDate())
                                .build();
        }
}
