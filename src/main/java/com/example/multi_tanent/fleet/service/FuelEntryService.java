package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.fleet.dtos.FuelEntryRequest;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fleet.dtos.FuelEntryResponse;
import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.entity.FuelEntry;
import com.example.multi_tanent.fleet.entity.Vehicle;
import com.example.multi_tanent.fleet.repository.DriverRepository;
import com.example.multi_tanent.fleet.repository.FuelEntryRepository;
import com.example.multi_tanent.fleet.repository.TripRepository;
import com.example.multi_tanent.fleet.repository.VehicleRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FuelEntryService {

    private final FuelEntryRepository fuelEntryRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TenantRepository tenantRepository;
    private final TripRepository tripRepository;
    private final FleetAccountingIntegrationService fleetAccountingIntegrationService;

    private static final String UPLOAD_DIR = "uploads/fleet/fuel";

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found: " + tenantId));
    }

    @Transactional
    public FuelEntryResponse createEntry(FuelEntryRequest request) {
        Tenant tenant = getCurrentTenant();
        
        Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(request.getVehicleId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found"));
        
        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findByIdAndEnterpriseId(request.getDriverId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Driver not found"));
        }

        FuelEntry entry = FuelEntry.builder()
                .tenant(tenant)
                .vehicle(vehicle)
                .driver(driver)
                .fuelDate(request.getFuelDate())
                .fuelStation(request.getFuelStation())
                .fuelType(request.getFuelType())
                .quantityLiters(request.getQuantityLiters())
                .amountAed(request.getAmountAed())
                .odometerReading(request.getOdometerReading())
                .notes(request.getNotes())
                .trip(request.getTripId() != null ? tripRepository.findById(request.getTripId()).orElse(null) : null)
                .build();

        // Update vehicle odometer if new reading is higher
        if (request.getOdometerReading() != null && 
            (vehicle.getOdometerReading() == null || request.getOdometerReading() > vehicle.getOdometerReading())) {
            vehicle.setOdometerReading(request.getOdometerReading());
            vehicleRepository.save(vehicle);
        }

        FuelEntry saved = fuelEntryRepository.save(entry);
        try {
            Long jeId = fleetAccountingIntegrationService.postFuelEntry(saved);
            saved.setJournalEntryId(jeId);
            saved = fuelEntryRepository.save(saved);
        } catch (Exception e) {
            log.error("Failed to automatically post fuel entry to ledger: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<FuelEntryResponse> listAll(Long vehicleId, Long tripId, LocalDate startDate, LocalDate endDate, String search, Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        String query = null;
        if (search != null && !search.trim().isEmpty()) {
            query = "%" + search.trim().toLowerCase() + "%";
        }
        return fuelEntryRepository.findByTenantIdAndFiltersWithDetails(
                tenant.getId(), vehicleId, tripId, startDate, endDate, query, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public FuelEntryResponse getEntry(Long id) {
        Tenant tenant = getCurrentTenant();
        FuelEntry entry = fuelEntryRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Fuel entry not found"));
        
        if (!entry.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }
        
        return mapToResponse(entry);
    }

    @Transactional
    public FuelEntryResponse updateEntry(Long id, FuelEntryRequest request) {
        Tenant tenant = getCurrentTenant();
        FuelEntry entry = fuelEntryRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Fuel entry not found"));

        if (!entry.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(request.getVehicleId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found"));

        Driver driver = null;
        if (request.getDriverId() != null) {
            driver = driverRepository.findByIdAndEnterpriseId(request.getDriverId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Driver not found"));
        }

        entry.setVehicle(vehicle);
        entry.setDriver(driver);
        entry.setFuelDate(request.getFuelDate());
        entry.setFuelStation(request.getFuelStation());
        entry.setFuelType(request.getFuelType());
        entry.setQuantityLiters(request.getQuantityLiters());
        entry.setAmountAed(request.getAmountAed());
        entry.setOdometerReading(request.getOdometerReading());
        entry.setNotes(request.getNotes());
        entry.setTrip(request.getTripId() != null ? tripRepository.findById(request.getTripId()).orElse(null) : null);

        // Update vehicle odometer if new reading is higher
        if (request.getOdometerReading() != null && 
            (vehicle.getOdometerReading() == null || request.getOdometerReading() > vehicle.getOdometerReading())) {
            vehicle.setOdometerReading(request.getOdometerReading());
            vehicleRepository.save(vehicle);
        }

        // Reverse old ledger entry if existed
        if (entry.getJournalEntryId() != null) {
            try {
                fleetAccountingIntegrationService.reverseJournalEntry(entry.getJournalEntryId());
                entry.setJournalEntryId(null);
            } catch (Exception e) {
                log.error("Failed to reverse old ledger entry for fuel entry {}: {}", id, e.getMessage());
            }
        }

        FuelEntry saved = fuelEntryRepository.save(entry);
        try {
            Long jeId = fleetAccountingIntegrationService.postFuelEntry(saved);
            saved.setJournalEntryId(jeId);
            saved = fuelEntryRepository.save(saved);
        } catch (Exception e) {
            log.error("Failed to automatically post updated fuel entry to ledger: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public void deleteEntry(Long id) {
        Tenant tenant = getCurrentTenant();
        FuelEntry entry = fuelEntryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fuel entry not found"));

        if (entry.getJournalEntryId() != null) {
            try {
                fleetAccountingIntegrationService.reverseJournalEntry(entry.getJournalEntryId());
            } catch (Exception e) {
                log.error("Failed to reverse ledger entry during fuel entry deletion: {}", e.getMessage());
            }
        }

        fuelEntryRepository.delete(entry);
    }

    @Transactional
    public FuelEntryResponse uploadReceipt(Long id, MultipartFile file) throws IOException {
        try {
            Tenant tenant = getCurrentTenant();
            FuelEntry entry = fuelEntryRepository.findByIdWithDetails(id)
                    .orElseThrow(() -> new EntityNotFoundException("Fuel entry not found"));

            if (!entry.getTenant().getId().equals(tenant.getId())) {
                throw new IllegalArgumentException("Access denied");
            }

            if (file != null && !file.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
                Path path = Paths.get(UPLOAD_DIR, tenant.getId().toString(), id.toString());
                Files.createDirectories(path);
                Path filePath = path.resolve(fileName);
                
                log.info("Uploading receipt for fuel entry {}: {} to {}", id, fileName, filePath);
                
                Files.copy(file.getInputStream(), filePath);
                entry.setReceiptPath(filePath.toString());
                
                // Ensure all fetched entities are initialized before mapping
                if (entry.getVehicle() != null) entry.getVehicle().getPlateNumber();
                if (entry.getDriver() != null) entry.getDriver().getName();
                if (entry.getTrip() != null) entry.getTrip().getTripNo();
                
                FuelEntry saved = fuelEntryRepository.save(entry);
                return mapToResponse(saved);
            }
            
            return mapToResponse(entry);
        } catch (Exception e) {
            log.error("Failed to upload receipt for fuel entry {}: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    private FuelEntryResponse mapToResponse(FuelEntry f) {
        // If the vehicle is a proxy, load it fully to avoid LazyInitializationException
        Vehicle v = f.getVehicle();
        if (v instanceof org.hibernate.proxy.HibernateProxy) {
            v = vehicleRepository.findById(v.getId()).orElse(v);
        }

        Driver d = f.getDriver();
        if (d instanceof org.hibernate.proxy.HibernateProxy && d != null) {
            d = driverRepository.findById(d.getId()).orElse(d);
        }

        com.example.multi_tanent.fleet.entity.Trip t = f.getTrip();
        if (t instanceof org.hibernate.proxy.HibernateProxy && t != null) {
            t = tripRepository.findById(t.getId()).orElse(t);
        }

        return FuelEntryResponse.builder()
                .id(f.getId())
                .vehicleId(v.getId())
                .vehiclePlateNumber(v.getPlateNumber())
                .vehicleMakeModel(v.getMake() + " " + v.getModel())
                .driverId(d != null ? d.getId() : null)
                .driverName(d != null ? d.getName() : "N/A")
                .fuelDate(f.getFuelDate())
                .fuelStation(f.getFuelStation())
                .fuelType(f.getFuelType())
                .quantityLiters(f.getQuantityLiters())
                .amountAed(f.getAmountAed())
                .odometerReading(f.getOdometerReading())
                .receiptPath(f.getReceiptPath())
                .notes(f.getNotes())
                .tripId(t != null ? t.getId() : null)
                .tripNo(t != null ? "TRP-" + t.getTripNo() : null)
                .createdAt(f.getCreatedAt())
                .build();
    }
}
