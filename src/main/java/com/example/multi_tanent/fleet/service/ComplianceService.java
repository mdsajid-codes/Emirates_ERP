package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.fleet.dtos.ComplianceDocumentResponse;
import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.entity.Vehicle;
import com.example.multi_tanent.fleet.repository.DriverRepository;
import com.example.multi_tanent.fleet.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplianceService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TenantRepository tenantRepository;
    private final com.example.multi_tanent.fleet.repository.VehicleMaintenanceRepository maintenanceRepository;

    @Transactional(readOnly = true)
    public List<ComplianceDocumentResponse> getExpiringDocuments(String statusFilter, Integer daysThreshold) {
        Tenant tenant = getCurrentTenant();
        List<ComplianceDocumentResponse> allDocs = new ArrayList<>();
        LocalDate today = LocalDate.now();
        int threshold = (daysThreshold != null) ? daysThreshold : 30;

        // 1. Scan Vehicles
        List<Vehicle> vehicles = vehicleRepository.findAllByEnterprise(tenant);
        for (Vehicle v : vehicles) {
            addDoc(allDocs, "VEHICLE", v.getId(), v.getPlateNumber(), "REGISTRATION", v.getRegistrationExpiry(), today, threshold);
            addDoc(allDocs, "VEHICLE", v.getId(), v.getPlateNumber(), "INSURANCE", v.getInsuranceExpiry(), today, threshold);
            addDoc(allDocs, "VEHICLE", v.getId(), v.getPlateNumber(), "PERMIT", v.getPermitExpiry(), today, threshold);
        }

        // 2. Scan Drivers
        List<Driver> drivers = driverRepository.findAllByEnterprise(tenant);
        for (Driver d : drivers) {
            addDoc(allDocs, "DRIVER", d.getId(), d.getName(), "LICENSE", d.getLicenseExpiry(), today, threshold);
            addDoc(allDocs, "DRIVER", d.getId(), d.getName(), "EMIRATES_ID", d.getEmiratesIdExpiry(), today, threshold);
        }

        // 3. Scan Overdue Maintenance
        List<com.example.multi_tanent.fleet.entity.VehicleMaintenance> maintenance = maintenanceRepository.findOverdueMaintenanceByTenant(tenant.getId(), today);
        for (com.example.multi_tanent.fleet.entity.VehicleMaintenance m : maintenance) {
            allDocs.add(ComplianceDocumentResponse.builder()
                .entityType("VEHICLE")
                .entityId(m.getVehicle() != null ? m.getVehicle().getId() : null)
                .entityName(m.getVehicle() != null ? m.getVehicle().getPlateNumber() : "Unknown")
                .documentType("MAINTENANCE_DUE")
                .expiryDate(m.getScheduledDate())
                .daysUntilExpiry(java.time.temporal.ChronoUnit.DAYS.between(today, m.getScheduledDate()))
                .status("EXPIRED") // Overdue is treated as expired
                .build());
        }

        // 3. Filter by status if requested
        if (statusFilter != null && !statusFilter.isEmpty()) {
            return allDocs.stream()
                    .filter(doc -> doc.getStatus().equalsIgnoreCase(statusFilter))
                    .collect(Collectors.toList());
        }

        return allDocs;
    }

    private void addDoc(List<ComplianceDocumentResponse> list, String entityType, Long entityId, String entityName, 
                        String docType, LocalDate expiryDate, LocalDate today, int threshold) {
        if (expiryDate == null) return;

        long daysLeft = ChronoUnit.DAYS.between(today, expiryDate);
        String status;
        if (daysLeft < 0) {
            status = "EXPIRED";
        } else if (daysLeft <= threshold) {
            status = "EXPIRING_SOON";
        } else {
            status = "VALID";
        }

        list.add(ComplianceDocumentResponse.builder()
                .entityType(entityType)
                .entityId(entityId)
                .entityName(entityName)
                .documentType(docType)
                .expiryDate(expiryDate)
                .daysUntilExpiry(daysLeft)
                .status(status)
                .build());
    }

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId).orElseThrow();
    }
}
