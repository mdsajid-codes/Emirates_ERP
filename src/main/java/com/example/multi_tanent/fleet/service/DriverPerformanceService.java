package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.fleet.dtos.DriverPerformanceRequest;
import com.example.multi_tanent.fleet.dtos.DriverPerformanceResponse;
import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.entity.DriverPerformance;
import com.example.multi_tanent.fleet.entity.FuelEntry;
import com.example.multi_tanent.fleet.repository.ComplaintRepository;
import com.example.multi_tanent.fleet.repository.DriverPerformanceRepository;
import com.example.multi_tanent.fleet.repository.DriverRepository;
import com.example.multi_tanent.fleet.repository.FuelEntryRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.fleet.entity.Trip;
import com.example.multi_tanent.fleet.repository.TripRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriverPerformanceService {

    private final DriverPerformanceRepository driverPerformanceRepository;
    private final TenantRepository tenantRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final ComplaintRepository complaintRepository;
    private final FuelEntryRepository fuelEntryRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
    }

    @Transactional
    public DriverPerformanceResponse savePerformance(DriverPerformanceRequest request) {
        Tenant tenant = getCurrentTenant();

        Driver driver = driverRepository.findByIdAndEnterpriseId(request.getDriverId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found"));

        Optional<DriverPerformance> existing = driverPerformanceRepository.findByUniqueConstraint(
                tenant.getId(), driver.getId(), request.getEvaluationPeriod());

        DriverPerformance performance = existing.orElseGet(DriverPerformance::new);
        
        performance.setTenant(tenant);
        performance.setDriver(driver);
        performance.setEvaluationPeriod(request.getEvaluationPeriod());
        performance.setTripsCompleted(request.getTripsCompleted());
        performance.setOnTimeDeliveryPercent(request.getOnTimeDeliveryPercent());
        performance.setIncidentsCount(request.getIncidentsCount());
        performance.setFuelEfficiencyScore(request.getFuelEfficiencyScore());
        performance.setIncentiveAmount(request.getIncentiveAmount());
        performance.setPenaltyAmount(request.getPenaltyAmount());
        performance.setRemarks(request.getRemarks());

        return mapToResponse(driverPerformanceRepository.save(performance));
    }

    @Transactional
    public DriverPerformanceResponse calculateMetrics(Long driverId, String period) {
        Tenant tenant = getCurrentTenant();
        
        Driver driver = driverRepository.findByIdAndEnterpriseId(driverId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found"));

        YearMonth yearMonth = YearMonth.parse(period);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        // Calculate Trips
        Page<Trip> trips = tripRepository.findAllFiltered(
                tenant, null, driver.getId(), null, startDate, endDate, null, Pageable.unpaged());
        int tripsCompleted = (int) trips.getTotalElements();

        // Calculate Incidents
        int incidentsCount = (int) complaintRepository.countByTenantIdAndDriverIdAndMonth(
                tenant.getId(), driver.getId(), period);

        // Calculate Fuel Efficiency (Placeholder logic for now)
        Page<FuelEntry> fuelEntries = fuelEntryRepository.findByTenantIdAndFiltersWithDetails(
                tenant.getId(), null, null, startDate, endDate, null, Pageable.unpaged());
        
        // Filter by driver in memory since repository method doesn't have driverId parameter
        double totalLiters = fuelEntries.stream()
                .filter(f -> f.getDriver() != null && f.getDriver().getId().equals(driver.getId()))
                .mapToDouble(f -> f.getQuantityLiters().doubleValue())
                .sum();
        
        double fuelEfficiencyScore = totalLiters > 0 ? (tripsCompleted * 50.0) / totalLiters : 0.0; // Assume avg 50km per trip

        DriverPerformanceRequest request = new DriverPerformanceRequest();
        request.setDriverId(driverId);
        request.setEvaluationPeriod(period);
        request.setTripsCompleted(tripsCompleted);
        request.setIncidentsCount(incidentsCount);
        request.setFuelEfficiencyScore(Math.round(fuelEfficiencyScore * 100.0) / 100.0);
        request.setOnTimeDeliveryPercent(100.0); // Default placeholder
        
        // Retrieve existing amounts if record already exists
        Optional<DriverPerformance> existing = driverPerformanceRepository.findByUniqueConstraint(
                tenant.getId(), driver.getId(), period);
                
        if (existing.isPresent()) {
            request.setIncentiveAmount(existing.get().getIncentiveAmount());
            request.setPenaltyAmount(existing.get().getPenaltyAmount());
            request.setRemarks(existing.get().getRemarks());
        }

        return savePerformance(request);
    }

    @Transactional(readOnly = true)
    public Page<DriverPerformanceResponse> listAll(Long driverId, String period, String search, Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        String query = null;
        if (search != null && !search.trim().isEmpty()) {
            query = "%" + search.trim().toLowerCase() + "%";
        }
        return driverPerformanceRepository.findByFiltersWithDetails(tenant.getId(), driverId, period, query, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public DriverPerformanceResponse getPerformance(Long id) {
        Tenant tenant = getCurrentTenant();
        DriverPerformance performance = driverPerformanceRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Performance record not found"));

        if (!performance.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        return mapToResponse(performance);
    }

    @Transactional
    public void deletePerformance(Long id) {
        Tenant tenant = getCurrentTenant();
        DriverPerformance performance = driverPerformanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Performance record not found"));

        if (!performance.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        driverPerformanceRepository.delete(performance);
    }

    private DriverPerformanceResponse mapToResponse(DriverPerformance p) {
        DriverPerformanceResponse response = new DriverPerformanceResponse();
        response.setId(p.getId());
        response.setDriverId(p.getDriver().getId());
        response.setDriverName(p.getDriver().getName());
        response.setEvaluationPeriod(p.getEvaluationPeriod());
        response.setTripsCompleted(p.getTripsCompleted());
        response.setOnTimeDeliveryPercent(p.getOnTimeDeliveryPercent());
        response.setIncidentsCount(p.getIncidentsCount());
        response.setFuelEfficiencyScore(p.getFuelEfficiencyScore());
        response.setIncentiveAmount(p.getIncentiveAmount());
        response.setPenaltyAmount(p.getPenaltyAmount());
        response.setRemarks(p.getRemarks());
        response.setCreatedAt(p.getCreatedAt());
        return response;
    }
}
