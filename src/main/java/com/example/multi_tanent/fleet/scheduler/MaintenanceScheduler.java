package com.example.multi_tanent.fleet.scheduler;

import com.example.multi_tanent.fleet.repository.VehicleMaintenanceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class MaintenanceScheduler {
    private final VehicleMaintenanceRepository maintenanceRepository;
    private final com.example.multi_tanent.spersusers.repository.TenantRepository tenantRepository;

    @Scheduled(cron = "0 0 1 * * ?") // Runs daily at 1 AM
    public void checkOverdueMaintenance() {
        log.info("Starting maintenance check scheduler...");
        LocalDate today = LocalDate.now();
        
        tenantRepository.findAll().forEach(tenant -> {
            maintenanceRepository.findOverdueMaintenanceByTenant(tenant.getId(), today).forEach(m -> {
                log.warn("Maintenance OVERDUE for tenant {} vehicle {}: Scheduled for {}, Status: {}", 
                    tenant.getTenantId(),
                    m.getVehicle() != null ? m.getVehicle().getPlateNumber() : "Unknown", 
                    m.getScheduledDate(), 
                    m.getStatus());
            });
        });
    }
}
