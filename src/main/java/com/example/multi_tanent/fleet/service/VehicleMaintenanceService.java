package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.fleet.dtos.VehicleMaintenanceRequest;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fleet.dtos.VehicleMaintenanceResponse;
import com.example.multi_tanent.fleet.entity.Vehicle;
import com.example.multi_tanent.fleet.entity.VehicleMaintenance;
import com.example.multi_tanent.fleet.enums.MaintenanceStatus;
import com.example.multi_tanent.fleet.enums.VehicleStatus;
import com.example.multi_tanent.fleet.repository.TripRepository;
import com.example.multi_tanent.fleet.repository.VehicleMaintenanceRepository;
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
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleMaintenanceService {

    private final VehicleMaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;
    private final TripRepository tripRepository;
    private final TenantRepository tenantRepository;
    private final FleetAccountingIntegrationService fleetAccountingIntegrationService;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    @Transactional
    public VehicleMaintenanceResponse createRequest(VehicleMaintenanceRequest request) {
        try {
            log.info("Creating maintenance request for vehicle: {} on trip: {}", request.getVehicleId(), request.getTripId());
            Tenant tenant = getCurrentTenant();
            Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(request.getVehicleId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + request.getVehicleId()));

            VehicleMaintenance maintenance = VehicleMaintenance.builder()
                    .vehicle(vehicle)
                    .tenant(tenant)
                    .maintenanceType(request.getMaintenanceType())
                    .serviceCategory(request.getServiceCategory())
                    .requestedDate(request.getRequestedDate())
                    .scheduledDate(request.getScheduledDate())
                    .garage(request.getGarage())
                    .odometerAtService(request.getOdometerAtService())
                    .estimatedCost(request.getEstimatedCost())
                    .status(MaintenanceStatus.REQUESTED)
                    .serviceNotes(request.getServiceNotes())
                    .trip(request.getTripId() != null ? tripRepository.findById(request.getTripId()).orElse(null) : null)
                    .createdAt(OffsetDateTime.now())
                    .updatedAt(OffsetDateTime.now())
                    .build();

            // Automatically update vehicle status to UNDER_MAINTENANCE when a request is
            // created
            vehicle.setVehicleStatus(VehicleStatus.UNDER_MAINTENANCE);
            vehicleRepository.save(vehicle);

            VehicleMaintenance saved = maintenanceRepository.saveAndFlush(maintenance);

            // Automatically post to ledger on creation (uses estimatedCost)
            try {
                Long jeId = fleetAccountingIntegrationService.postVehicleMaintenance(saved);
                saved.setJournalEntryId(jeId);
                saved = maintenanceRepository.saveAndFlush(saved);
            } catch (Exception e) {
                log.error("Failed to automatically post maintenance request to ledger: {}", e.getMessage());
            }

            return mapToResponse(saved);
        } catch (Exception e) {
            log.error("Failed to create maintenance request: ", e);
            throw new RuntimeException("Error creating maintenance request: " + e.getMessage());
        }
    }

    @Transactional
    public VehicleMaintenanceResponse updateStatus(Long id, MaintenanceStatus status) {
        try {
            Tenant tenant = getCurrentTenant();
            VehicleMaintenance maintenance = maintenanceRepository.findByIdWithVehicle(id)
                    .orElseThrow(() -> new EntityNotFoundException("Maintenance record not found"));

            if (!maintenance.getTenant().getId().equals(tenant.getId())) {
                throw new IllegalArgumentException("Access denied");
            }

            maintenance.setStatus(status);

            // If completed or cancelled, set vehicle back to ACTIVE
            if (status == MaintenanceStatus.COMPLETED || status == MaintenanceStatus.CANCELLED) {
                Vehicle vehicle = vehicleRepository.findById(maintenance.getVehicle().getId())
                        .orElse(null);
                if (vehicle != null) {
                    vehicle.setVehicleStatus(VehicleStatus.ACTIVE);
                    vehicleRepository.save(vehicle);
                    maintenance.setVehicle(vehicle);
                }

                // If cancelled and was previously posted, reverse the ledger entry
                if (status == MaintenanceStatus.CANCELLED && maintenance.getJournalEntryId() != null) {
                    try {
                        fleetAccountingIntegrationService.reverseJournalEntry(maintenance.getJournalEntryId());
                        maintenance.setJournalEntryId(null);
                    } catch (Exception e) {
                        log.error("Failed to reverse ledger entry during maintenance cancellation: {}", e.getMessage());
                    }
                }

                if (status == MaintenanceStatus.COMPLETED) {
                    maintenance.setCompletedDate(LocalDate.now());
                    if (maintenance.getJournalEntryId() == null) {
                        try {
                            Long jeId = fleetAccountingIntegrationService.postVehicleMaintenance(maintenance);
                            maintenance.setJournalEntryId(jeId);
                        } catch (Exception e) {
                            log.error("Failed to post vehicle maintenance to ledger during completion status update: {}", e.getMessage());
                        }
                    }
                }
            } else {
                // Pre-load vehicle to avoid LazyInitializationException in mapToResponse
                Vehicle vehicle = vehicleRepository.findById(maintenance.getVehicle().getId())
                        .orElse(null);
                maintenance.setVehicle(vehicle);
            }

            // Save, but map `maintenance` directly — saveAndFlush returns a new proxy
            // reference with a lazy vehicle, discarding the initialized Vehicle we set above.
            maintenanceRepository.saveAndFlush(maintenance);
            return mapToResponse(maintenance);
        } catch (Exception e) {
            log.error("Error updating maintenance status: ", e);
            throw new RuntimeException("Backend Error: " + e.getMessage(), e);
        }
    }

    @Transactional
    public VehicleMaintenanceResponse completeRequest(Long id, BigDecimal actualCost, String notes) {
        Tenant tenant = getCurrentTenant();
        VehicleMaintenance maintenance = maintenanceRepository.findByIdWithVehicle(id)
                .orElseThrow(() -> new EntityNotFoundException("Maintenance record not found"));

        if (!maintenance.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        maintenance.setStatus(MaintenanceStatus.COMPLETED);
        maintenance.setActualCost(actualCost);
        maintenance.setCompletedDate(LocalDate.now());
        if (notes != null) {
            maintenance.setServiceNotes(maintenance.getServiceNotes() + "\nCompletion Notes: " + notes);
        }
        maintenance.setUpdatedAt(OffsetDateTime.now());

        Vehicle vehicle = maintenance.getVehicle();
        vehicle.setVehicleStatus(VehicleStatus.ACTIVE);
        vehicleRepository.save(vehicle);

        // Reverse previous ledger entry if existed before posting completed cost
        if (maintenance.getJournalEntryId() != null) {
            try {
                fleetAccountingIntegrationService.reverseJournalEntry(maintenance.getJournalEntryId());
                maintenance.setJournalEntryId(null);
            } catch (Exception e) {
                log.error("Failed to reverse old maintenance ledger entry: {}", e.getMessage());
            }
        }

        VehicleMaintenance saved = maintenanceRepository.save(maintenance);

        // Post completed maintenance to ledger
        try {
            Long jeId = fleetAccountingIntegrationService.postVehicleMaintenance(saved);
            saved.setJournalEntryId(jeId);
            saved = maintenanceRepository.save(saved);
        } catch (Exception e) {
            log.error("Failed to post vehicle maintenance to ledger: {}", e.getMessage());
        }

        Vehicle v = vehicleRepository.findById(saved.getVehicle().getId()).orElse(null);
        saved.setVehicle(v);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<VehicleMaintenanceResponse> listAll(MaintenanceStatus status, Long tripId, Long vehicleId, String search, Pageable pageable) {
        try {
            Tenant tenant = getCurrentTenant();
            if (tripId != null) {
                return maintenanceRepository.findByTenantIdAndTripIdWithVehicle(tenant.getId(), tripId, pageable)
                        .map(this::mapToResponse);
            }
            if (vehicleId != null) {
                return maintenanceRepository.findByTenantIdAndVehicleIdWithVehicle(tenant.getId(), vehicleId, pageable)
                        .map(this::mapToResponse);
            }
            String query = null;
            if (search != null && !search.trim().isEmpty()) {
                query = "%" + search.trim().toLowerCase() + "%";
            }
            return maintenanceRepository.findAllFiltered(tenant.getId(), status, query, pageable)
                    .map(this::mapToResponse);
        } catch (Exception e) {
            log.error("Error listing maintenance records: ", e);
            throw e;
        }
    }

    private VehicleMaintenanceResponse mapToResponse(VehicleMaintenance m) {
        // If the vehicle is a proxy, load it fully to avoid LazyInitializationException
        Vehicle v = m.getVehicle();
        if (v instanceof org.hibernate.proxy.HibernateProxy && v != null) {
            v = vehicleRepository.findById(v.getId()).orElse(v);
        }

        com.example.multi_tanent.fleet.entity.Trip t = m.getTrip();
        if (t instanceof org.hibernate.proxy.HibernateProxy && t != null) {
            t = tripRepository.findById(t.getId()).orElse(t);
        }

        return VehicleMaintenanceResponse.builder()
                .id(m.getId())
                .vehicleId(v != null ? v.getId() : null)
                .vehiclePlateNumber(v != null ? v.getPlateNumber() : "N/A")
                .vehicleMakeModel(v != null ? (v.getMake() + " " + v.getModel()) : "N/A")
                .maintenanceType(m.getMaintenanceType())
                .serviceCategory(m.getServiceCategory())
                .requestedDate(m.getRequestedDate())
                .scheduledDate(m.getScheduledDate())
                .completedDate(m.getCompletedDate())
                .garage(m.getGarage())
                .odometerAtService(m.getOdometerAtService())
                .estimatedCost(m.getEstimatedCost())
                .actualCost(m.getActualCost())
                .status(m.getStatus())
                .serviceNotes(m.getServiceNotes())
                .spareParts(m.getSpareParts())
                .invoicePath(m.getInvoicePath())
                .tripId(t != null ? t.getId() : null)
                .tripNo(t != null ? t.getTripNo().toString() : null)
                .createdAt(m.getCreatedAt())
                .build();
    }

    @Transactional
    public VehicleMaintenanceResponse updateRecord(Long id, VehicleMaintenanceRequest request) {
        Tenant tenant = getCurrentTenant();
        VehicleMaintenance m = maintenanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Maintenance record not found"));

        if (!m.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found"));

        m.setVehicle(vehicle);
        m.setMaintenanceType(request.getMaintenanceType());
        m.setServiceCategory(request.getServiceCategory());
        m.setRequestedDate(request.getRequestedDate());
        m.setScheduledDate(request.getScheduledDate());
        m.setGarage(request.getGarage());
        m.setOdometerAtService(request.getOdometerAtService());
        m.setEstimatedCost(request.getEstimatedCost());
        m.setServiceNotes(request.getServiceNotes());
        m.setSpareParts(request.getSpareParts());
        m.setTrip(request.getTripId() != null ? tripRepository.findById(request.getTripId()).orElse(null) : null);

        // Reverse old ledger entry if existed
        if (m.getJournalEntryId() != null) {
            try {
                fleetAccountingIntegrationService.reverseJournalEntry(m.getJournalEntryId());
                m.setJournalEntryId(null);
            } catch (Exception e) {
                log.error("Failed to reverse old ledger entry for maintenance update: {}", e.getMessage());
            }
        }

        VehicleMaintenance saved = maintenanceRepository.save(m);
        try {
            Long jeId = fleetAccountingIntegrationService.postVehicleMaintenance(saved);
            saved.setJournalEntryId(jeId);
            saved = maintenanceRepository.save(saved);
        } catch (Exception e) {
            log.error("Failed to post updated maintenance to ledger: {}", e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Transactional
    public VehicleMaintenanceResponse uploadInvoice(Long id, MultipartFile file) throws IOException {
        Tenant tenant = getCurrentTenant();
        VehicleMaintenance m = maintenanceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Maintenance record not found"));

        if (!m.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get("uploads/fleet/maintenance", tenant.getId().toString(), id.toString());
            Files.createDirectories(path);
            Path filePath = path.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            m.setInvoicePath(filePath.toString());
            return mapToResponse(maintenanceRepository.save(m));
        }

        return mapToResponse(m);
    }
}
