package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.fleet.dtos.VehicleRequest;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fleet.dtos.VehicleResponse;
import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.entity.Vehicle;
import com.example.multi_tanent.fleet.enums.VehicleStatus;
import com.example.multi_tanent.fleet.repository.DriverRepository;
import com.example.multi_tanent.fleet.repository.VehicleRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TenantRepository tenantRepository;
    private final com.example.multi_tanent.fleet.repository.VehicleDocumentRepository vehicleDocumentRepository;
    private final com.example.multi_tanent.warehouse.service.WareStorageService storageService;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        Tenant tenant = getCurrentTenant();
        vehicleRepository.findByPlateNumberAndEnterpriseId(request.getPlateNumber(), tenant.getId())
                .ifPresent(v -> {
                    throw new IllegalArgumentException("Vehicle with plate number " + request.getPlateNumber() + " already exists");
                });

        if (request.getEngineNumber() != null && !request.getEngineNumber().isBlank()) {
            vehicleRepository.findByEngineNumberAndEnterpriseId(request.getEngineNumber(), tenant.getId())
                    .ifPresent(v -> {
                        throw new IllegalArgumentException("Vehicle with engine number " + request.getEngineNumber() + " already exists");
                    });
        }

        if (request.getVinNumber() != null && !request.getVinNumber().isBlank()) {
            vehicleRepository.findByVinNumberAndEnterpriseId(request.getVinNumber(), tenant.getId())
                    .ifPresent(v -> {
                        throw new IllegalArgumentException("Vehicle with VIN number " + request.getVinNumber() + " already exists");
                    });
        }

        Vehicle vehicle = Vehicle.builder()
                .plateNumber(request.getPlateNumber())
                .vehicleType(request.getVehicleType())
                .make(request.getMake())
                .model(request.getModel())
                .year(request.getYear())
                .color(request.getColor())
                .vinNumber(request.getVinNumber())
                .engineNumber(request.getEngineNumber())
                .fuelType(request.getFuelType())
                .yardLocation(request.getYardLocation())
                .permitExpiry(request.getPermitExpiry())
                .vehicleStatus(request.getVehicleStatus() != null && !request.getVehicleStatus().isBlank() ? VehicleStatus.valueOf(request.getVehicleStatus().toUpperCase()) : VehicleStatus.ACTIVE)
                .capacityWeight(request.getCapacityWeight())
                .capacityVolume(request.getCapacityVolume())
                .odometerReading(request.getOdometerReading())
                .insuranceNumber(request.getInsuranceNumber())
                .insuranceExpiry(request.getInsuranceExpiry())
                .registrationExpiry(request.getRegistrationExpiry())
                .notes(request.getNotes())
                .enterprise(tenant)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        if (request.getAssignedDriverId() != null) {
            Driver driver = driverRepository.findByIdAndEnterpriseId(request.getAssignedDriverId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + request.getAssignedDriverId()));
            vehicle.setAssignedDriver(driver);
        }

        Vehicle saved = vehicleRepository.save(vehicle);
        return mapToResponse(saved);
    }

    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Tenant tenant = getCurrentTenant();
        Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + id));

        // Check for plate number uniqueness
        vehicleRepository.findByPlateNumberAndEnterpriseId(request.getPlateNumber(), tenant.getId())
                .ifPresent(v -> {
                    if (!v.getId().equals(vehicle.getId())) {
                        throw new IllegalArgumentException("Vehicle with plate number " + request.getPlateNumber() + " already exists");
                    }
                });

        if (request.getEngineNumber() != null && !request.getEngineNumber().isBlank()) {
            vehicleRepository.findByEngineNumberAndEnterpriseId(request.getEngineNumber(), tenant.getId())
                    .ifPresent(v -> {
                        if (!v.getId().equals(vehicle.getId())) {
                            throw new IllegalArgumentException("Vehicle with engine number " + request.getEngineNumber() + " already exists");
                        }
                    });
        }

        if (request.getVinNumber() != null && !request.getVinNumber().isBlank()) {
            vehicleRepository.findByVinNumberAndEnterpriseId(request.getVinNumber(), tenant.getId())
                    .ifPresent(v -> {
                        if (!v.getId().equals(vehicle.getId())) {
                            throw new IllegalArgumentException("Vehicle with VIN number " + request.getVinNumber() + " already exists");
                        }
                    });
        }

        try {
            vehicle.setPlateNumber(request.getPlateNumber());
            vehicle.setVehicleType(request.getVehicleType());
            vehicle.setMake(request.getMake());
            vehicle.setModel(request.getModel());
            vehicle.setYear(request.getYear());
            vehicle.setColor(request.getColor());
            vehicle.setVinNumber(request.getVinNumber());
            vehicle.setEngineNumber(request.getEngineNumber());
            vehicle.setFuelType(request.getFuelType());
            vehicle.setYardLocation(request.getYardLocation());
            vehicle.setPermitExpiry(request.getPermitExpiry());
            if (request.getVehicleStatus() != null && !request.getVehicleStatus().isBlank()) {
                vehicle.setVehicleStatus(VehicleStatus.valueOf(request.getVehicleStatus().toUpperCase()));
            }
            vehicle.setCapacityWeight(request.getCapacityWeight());
            vehicle.setCapacityVolume(request.getCapacityVolume());
            vehicle.setOdometerReading(request.getOdometerReading());
            vehicle.setInsuranceNumber(request.getInsuranceNumber());
            vehicle.setInsuranceExpiry(request.getInsuranceExpiry());
            vehicle.setRegistrationExpiry(request.getRegistrationExpiry());
            vehicle.setNotes(request.getNotes());
            if (request.getIsActive() != null) {
                vehicle.setIsActive(request.getIsActive());
            }

            if (request.getAssignedDriverId() != null) {
                Driver driver = driverRepository.findByIdAndEnterpriseId(request.getAssignedDriverId(), tenant.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + request.getAssignedDriverId()));
                
                // 1. If driver already had another vehicle, clear that vehicle's driver link
                if (driver.getAssignedVehicle() != null && !driver.getAssignedVehicle().getId().equals(vehicle.getId())) {
                    Vehicle otherVehicle = driver.getAssignedVehicle();
                    otherVehicle.setAssignedDriver(null);
                    vehicleRepository.save(otherVehicle);
                }

                // 2. Set the new assignment
                vehicle.setAssignedDriver(driver);
                driver.setAssignedVehicle(vehicle);
                driverRepository.save(driver);
            } else {
                // Unassign current if any
                if (vehicle.getAssignedDriver() != null) {
                    Driver oldDriver = vehicle.getAssignedDriver();
                    oldDriver.setAssignedVehicle(null);
                    driverRepository.save(oldDriver);
                    vehicle.setAssignedDriver(null);
                }
            }

            Vehicle updated = vehicleRepository.save(vehicle);
            return mapToResponse(updated);
        } catch (Exception e) {
            // log.error is handled if Slf4j is added, otherwise just throw
            throw new RuntimeException("Vehicle Update Backend Error: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public VehicleResponse getVehicle(Long id) {
        Tenant tenant = getCurrentTenant();
        Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + id));
        return mapToResponse(vehicle);
    }

    @Transactional(readOnly = true)
    public Page<VehicleResponse> listVehicles(Pageable pageable) {
        return listVehicles(null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<VehicleResponse> listVehicles(String search, Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        Page<Vehicle> vehicles;
        if (search != null && !search.trim().isEmpty()) {
            String query = "%" + search.trim().toLowerCase() + "%";
            vehicles = vehicleRepository.searchVehicles(tenant.getId(), query, pageable);
        } else {
            vehicles = vehicleRepository.findByEnterpriseIdAndIsActiveTrue(tenant.getId(), pageable);
        }
        return vehicles.map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public java.util.List<VehicleResponse> listAllVehicles() {
        Tenant tenant = getCurrentTenant();
        return vehicleRepository.findByEnterpriseIdAndIsActiveTrue(tenant.getId(), Pageable.unpaged())
                .getContent().stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    public void deleteVehicle(Long id) {
        Tenant tenant = getCurrentTenant();
        Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + id));
        vehicle.setIsActive(false);
        vehicleRepository.save(vehicle);
    }

    @Transactional
    public com.example.multi_tanent.fleet.dtos.VehicleDocumentResponse uploadDocument(Long vehicleId, com.example.multi_tanent.fleet.enums.VehicleDocumentType type, java.time.LocalDate expiryDate, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        Tenant tenant = getCurrentTenant();
        Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(vehicleId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found"));

        String path = storageService.storeVehicleDocumentFile(file, tenant.getId().toString(), vehicle.getPlateNumber());

        com.example.multi_tanent.fleet.entity.VehicleDocument doc = com.example.multi_tanent.fleet.entity.VehicleDocument.builder()
                .vehicle(vehicle)
                .tenant(tenant)
                .documentType(type)
                .filePath(path)
                .expiryDate(expiryDate)
                .uploadedAt(java.time.OffsetDateTime.now())
                .build();

        // Sync expiry date to vehicle entity if it's a known compliance type
        if (expiryDate != null) {
            switch (type) {
                case INSURANCE -> vehicle.setInsuranceExpiry(expiryDate);
                case REGISTRATION -> vehicle.setRegistrationExpiry(expiryDate);
                case PERMIT -> vehicle.setPermitExpiry(expiryDate);
                default -> {}
            }
            vehicleRepository.save(vehicle);
        }

        com.example.multi_tanent.fleet.entity.VehicleDocument saved = vehicleDocumentRepository.save(doc);
        return mapToDocumentResponse(saved);
    }

    @Transactional(readOnly = true)
    public java.util.List<com.example.multi_tanent.fleet.dtos.VehicleDocumentResponse> getDocuments(Long vehicleId) {
        Tenant tenant = getCurrentTenant();
        return vehicleDocumentRepository.findByVehicleIdAndTenantId(vehicleId, tenant.getId()).stream()
                .map(this::mapToDocumentResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private com.example.multi_tanent.fleet.dtos.VehicleDocumentResponse mapToDocumentResponse(com.example.multi_tanent.fleet.entity.VehicleDocument doc) {
        return com.example.multi_tanent.fleet.dtos.VehicleDocumentResponse.builder()
                .id(doc.getId())
                .vehicleId(doc.getVehicle().getId())
                .documentType(doc.getDocumentType())
                .filePath(doc.getFilePath())
                .expiryDate(doc.getExpiryDate())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }

    private VehicleResponse mapToResponse(Vehicle vehicle) {
        VehicleResponse res = VehicleResponse.builder()
                .id(vehicle.getId())
                .plateNumber(vehicle.getPlateNumber())
                .vehicleType(vehicle.getVehicleType())
                .make(vehicle.getMake())
                .model(vehicle.getModel())
                .year(vehicle.getYear())
                .color(vehicle.getColor())
                .vinNumber(vehicle.getVinNumber())
                .engineNumber(vehicle.getEngineNumber())
                .fuelType(vehicle.getFuelType())
                .yardLocation(vehicle.getYardLocation())
                .permitExpiry(vehicle.getPermitExpiry())
                .vehicleStatus(vehicle.getVehicleStatus())
                .capacityWeight(vehicle.getCapacityWeight())
                .capacityVolume(vehicle.getCapacityVolume())
                .odometerReading(vehicle.getOdometerReading())
                .insuranceNumber(vehicle.getInsuranceNumber())
                .insuranceExpiry(vehicle.getInsuranceExpiry())
                .registrationExpiry(vehicle.getRegistrationExpiry())
                .isActive(vehicle.getIsActive())
                .notes(vehicle.getNotes())
                .createdAt(vehicle.getCreatedAt())
                .updatedAt(vehicle.getUpdatedAt())
                .build();

        if (vehicle.getAssignedDriver() != null) {
            Driver d = vehicle.getAssignedDriver();
            try {
                res.setAssignedDriverId(d.getId());
                res.setAssignedDriverName(d.getName());
            } catch (Exception e) {
                driverRepository.findById(d.getId()).ifPresent(driver -> {
                    res.setAssignedDriverId(driver.getId());
                    res.setAssignedDriverName(driver.getName());
                });
            }
        }

        return res;
    }
}
