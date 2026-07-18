package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.fleet.dtos.DriverRequest;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fleet.dtos.DriverResponse;
import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.entity.Vehicle;
import com.example.multi_tanent.fleet.enums.DriverStatus;
import com.example.multi_tanent.fleet.repository.DriverRepository;
import com.example.multi_tanent.fleet.repository.VehicleRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Set;
import com.example.multi_tanent.master.enums.Role;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DriverService {

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.example.multi_tanent.warehouse.service.WareStorageService storageService;
    private final com.example.multi_tanent.fleet.repository.DriverDocumentRepository driverDocumentRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    @Transactional
    public DriverResponse createDriver(DriverRequest request) {
        Tenant tenant = getCurrentTenant();

        driverRepository.findByEmployeeCodeAndEnterpriseId(request.getEmployeeCode(), tenant.getId())
                .ifPresent(d -> {
                    throw new IllegalArgumentException("Driver with employee code " + request.getEmployeeCode() + " already exists");
                });

        if (request.getEmiratesId() != null && !request.getEmiratesId().isBlank()) {
            driverRepository.findByEmiratesIdAndEnterpriseId(request.getEmiratesId(), tenant.getId())
                    .ifPresent(d -> {
                        throw new IllegalArgumentException("Driver with Emirates ID " + request.getEmiratesId() + " already exists");
                    });
        }

        Driver driver = Driver.builder()
                .employeeCode(request.getEmployeeCode())
                .name(request.getName())
                .phone(request.getPhone())
                .email(request.getEmail())
                .address(request.getAddress())
                .dateOfBirth(request.getDateOfBirth())
                .joiningDate(request.getJoiningDate())
                .emergencyContact(request.getEmergencyContact())
                .licenseNumber(request.getLicenseNumber())
                .licenseType(request.getLicenseType())
                .licenseExpiry(request.getLicenseExpiry())
                .emiratesId(request.getEmiratesId())
                .emiratesIdExpiry(request.getEmiratesIdExpiry())
                .nationality(request.getNationality())
                .visaExpiry(request.getVisaExpiry())
                .profileImageUrl(request.getProfileImageUrl())
                .status(request.getStatus() != null && !request.getStatus().isBlank() ? DriverStatus.valueOf(request.getStatus().toUpperCase()) : DriverStatus.AVAILABLE)
                .notes(request.getNotes())
                .enterprise(tenant)
                .build();

        if (request.getAssignedVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(request.getAssignedVehicleId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + request.getAssignedVehicleId()));
            driver.setAssignedVehicle(vehicle);
        }

        if (request.getUserId() != null) {
            User user = userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + request.getUserId()));
            driver.setUser(user);
        } else if (request.getPassword() != null && !request.getPassword().isBlank()) {
            // Create a new User for this driver
            if (request.getEmail() == null || request.getEmail().isBlank()) {
                throw new IllegalArgumentException("Email is required to create a user account");
            }
            
            userRepository.findByEmail(request.getEmail())
                    .ifPresent(u -> {
                        throw new IllegalArgumentException("User with email " + request.getEmail() + " already exists");
                    });

            User newUser = new User();
            newUser.setName(request.getName());
            newUser.setEmail(request.getEmail());
            newUser.setPasswordHash(passwordEncoder.encode(request.getPassword()));
            newUser.setRoles(Set.of(Role.DRIVER));
            newUser.setIsActive(true);
            newUser.setIsLocked(false);
            newUser.setLoginAttempts(0);
            newUser.setCreatedAt(LocalDateTime.now());
            newUser.setTenant(tenant);
            
            User savedUser = userRepository.save(newUser);
            driver.setUser(savedUser);
        }

        Driver saved = driverRepository.save(driver);
        return mapToResponse(saved);
    }

    @Transactional
    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Tenant tenant = getCurrentTenant();
        Driver driver = driverRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + id));

        // Check if employee code is already used by another driver
        driverRepository.findByEmployeeCodeAndEnterpriseId(request.getEmployeeCode(), tenant.getId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(driver.getId())) {
                        throw new IllegalArgumentException("Employee code " + request.getEmployeeCode() + " is already used by another driver");
                    }
                });

        // Check if license number is already used by another driver
        driverRepository.findByLicenseNumberAndEnterpriseId(request.getLicenseNumber(), tenant.getId())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(driver.getId())) {
                        throw new IllegalArgumentException("License number " + request.getLicenseNumber() + " is already registered to another driver");
                    }
                });

        // Check if emirates id is already used by another driver
        if (request.getEmiratesId() != null && !request.getEmiratesId().isBlank()) {
            driverRepository.findByEmiratesIdAndEnterpriseId(request.getEmiratesId(), tenant.getId())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(driver.getId())) {
                            throw new IllegalArgumentException("Emirates ID " + request.getEmiratesId() + " is already registered to another driver");
                        }
                    });
        }

        try {
            driver.setName(request.getName());
            driver.setPhone(request.getPhone());
            driver.setEmail(request.getEmail());
            driver.setAddress(request.getAddress());
            driver.setDateOfBirth(request.getDateOfBirth());
            driver.setJoiningDate(request.getJoiningDate());
            driver.setEmergencyContact(request.getEmergencyContact());
            driver.setLicenseNumber(request.getLicenseNumber());
            driver.setLicenseType(request.getLicenseType());
            driver.setLicenseExpiry(request.getLicenseExpiry());
            driver.setEmiratesId(request.getEmiratesId());
            driver.setEmiratesIdExpiry(request.getEmiratesIdExpiry());
            driver.setNationality(request.getNationality());
            driver.setVisaExpiry(request.getVisaExpiry());
            driver.setProfileImageUrl(request.getProfileImageUrl());
            
            if (request.getStatus() != null && !request.getStatus().isBlank()) {
                driver.setStatus(DriverStatus.valueOf(request.getStatus().toUpperCase()));
            }
            driver.setNotes(request.getNotes());

            // Bidirectional Assignment Sync
            if (request.getAssignedVehicleId() != null) {
                Vehicle newVehicle = vehicleRepository.findByIdAndEnterpriseId(request.getAssignedVehicleId(), tenant.getId())
                        .orElseThrow(() -> new EntityNotFoundException("Vehicle not found with ID: " + request.getAssignedVehicleId()));
                
                // 1. If driver already had a vehicle, clear that vehicle's driver link
                if (driver.getAssignedVehicle() != null) {
                    Vehicle oldVehicle = driver.getAssignedVehicle();
                    oldVehicle.setAssignedDriver(null);
                    vehicleRepository.save(oldVehicle);
                }

                // 2. If new vehicle was with another driver, clear that driver's vehicle link
                if (newVehicle.getAssignedDriver() != null && !newVehicle.getAssignedDriver().getId().equals(driver.getId())) {
                    Driver otherDriver = newVehicle.getAssignedDriver();
                    otherDriver.setAssignedVehicle(null);
                    driverRepository.save(otherDriver);
                }

                // 3. Set the new assignment
                driver.setAssignedVehicle(newVehicle);
                newVehicle.setAssignedDriver(driver);
                vehicleRepository.save(newVehicle);
            } else {
                // Clear current assignment if any
                if (driver.getAssignedVehicle() != null) {
                    Vehicle oldVehicle = driver.getAssignedVehicle();
                    oldVehicle.setAssignedDriver(null);
                    vehicleRepository.save(oldVehicle);
                }
                driver.setAssignedVehicle(null);
            }

            if (request.getUserId() != null) {
                User user = userRepository.findById(request.getUserId())
                        .orElseThrow(() -> new EntityNotFoundException("User not found with ID: " + request.getUserId()));
                driver.setUser(user);
            }

            Driver saved = driverRepository.save(driver);
            return mapToResponse(saved);
        } catch (Exception e) {
            log.error("DRIVER UPDATE FAILED: {}", e.getMessage(), e);
            throw new RuntimeException("Backend failure: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public DriverResponse getDriver(Long id) {
        Tenant tenant = getCurrentTenant();
        Driver driver = driverRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + id));
        return mapToResponse(driver);
    }

    @Transactional(readOnly = true)
    public Page<DriverResponse> listDrivers(String status, Pageable pageable) {
        return listDrivers(status, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<DriverResponse> listDrivers(String status, String search, Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        Page<Driver> drivers;
        
        DriverStatus driverStatus = null;
        if (status != null && !status.trim().isEmpty()) {
            driverStatus = DriverStatus.valueOf(status.toUpperCase());
        }

        if (search != null && !search.trim().isEmpty()) {
            String query = "%" + search.trim().toLowerCase() + "%";
            drivers = driverRepository.searchDrivers(tenant.getId(), driverStatus, query, pageable);
        } else {
            if (driverStatus != null) {
                drivers = driverRepository.findByEnterpriseIdAndStatusAndIsActiveTrue(tenant.getId(), driverStatus, pageable);
            } else {
                drivers = driverRepository.findByEnterpriseIdAndIsActiveTrue(tenant.getId(), pageable);
            }
        }
        return drivers.map(this::mapToResponse);
    }

    @Transactional
    public void deleteDriver(Long id) {
        Tenant tenant = getCurrentTenant();
        Driver driver = driverRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + id));
        driver.setIsActive(false);
        driverRepository.save(driver);
    }

    @Transactional(readOnly = true)
    public java.util.List<DriverResponse> listAllDrivers() {
        Tenant tenant = getCurrentTenant();
        return driverRepository.findByEnterpriseIdAndIsActiveTrue(tenant.getId(), Pageable.unpaged())
                .getContent().stream()
                .map(this::mapToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private DriverResponse mapToResponse(Driver driver) {
        DriverResponse res = DriverResponse.builder()
                .id(driver.getId())
                .employeeCode(driver.getEmployeeCode())
                .name(driver.getName())
                .phone(driver.getPhone())
                .email(driver.getEmail())
                .address(driver.getAddress())
                .dateOfBirth(driver.getDateOfBirth())
                .joiningDate(driver.getJoiningDate())
                .emergencyContact(driver.getEmergencyContact())
                .licenseNumber(driver.getLicenseNumber())
                .licenseType(driver.getLicenseType())
                .licenseExpiry(driver.getLicenseExpiry())
                .emiratesId(driver.getEmiratesId())
                .emiratesIdExpiry(driver.getEmiratesIdExpiry())
                .nationality(driver.getNationality())
                .visaExpiry(driver.getVisaExpiry())
                .profileImageUrl(driver.getProfileImageUrl())
                .status(driver.getStatus())
                .isActive(driver.getIsActive())
                .notes(driver.getNotes())
                .userId(driver.getUser() != null ? driver.getUser().getId() : null)
                .createdAt(driver.getCreatedAt())
                .updatedAt(driver.getUpdatedAt())
                .build();

        if (driver.getAssignedVehicle() != null) {
            Vehicle vehicle = driver.getAssignedVehicle();
            try {
                // Try to access property to trigger lazy load
                res.setAssignedVehicleId(vehicle.getId());
                res.setAssignedVehiclePlateNumber(vehicle.getPlateNumber());
            } catch (Exception e) {
                // If lazy load fails, try to fetch it explicitly
                vehicleRepository.findById(vehicle.getId()).ifPresent(v -> {
                    res.setAssignedVehicleId(v.getId());
                    res.setAssignedVehiclePlateNumber(v.getPlateNumber());
                });
            }
        }

        return res;
    }

    @Transactional
    public DriverResponse uploadProfileImage(Long id, MultipartFile file) {
        Tenant tenant = getCurrentTenant();
        Driver driver = driverRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + id));

        try {
            String filePath = storageService.storeDriverProfileFile(file, String.valueOf(tenant.getId()), driver.getEmployeeCode());
            driver.setProfileImageUrl(filePath);
            return mapToResponse(driverRepository.save(driver));
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to store profile image", e);
        }
    }

    @Transactional(readOnly = true)
    public Resource getProfileImage(Long id) {
        Tenant tenant = getCurrentTenant();
        Driver driver = driverRepository.findByIdAndEnterpriseId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found with ID: " + id));

        if (driver.getProfileImageUrl() == null) {
            throw new IllegalArgumentException("Driver has no profile image");
        }

        return storageService.loadFileAsResource(driver.getProfileImageUrl());
    }

    @Transactional
    public com.example.multi_tanent.fleet.dtos.DriverDocumentResponse uploadDocument(Long driverId, com.example.multi_tanent.fleet.enums.DriverDocumentType type, String docNumber, java.time.LocalDate expiryDate, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        Tenant tenant = getCurrentTenant();
        Driver driver = driverRepository.findByIdAndEnterpriseId(driverId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found"));

        String path = storageService.storeDriverDocumentFile(file, tenant.getId().toString(), driver.getEmployeeCode());

        com.example.multi_tanent.fleet.entity.DriverDocument doc = com.example.multi_tanent.fleet.entity.DriverDocument.builder()
                .driver(driver)
                .tenant(tenant)
                .documentType(type)
                .documentNumber(docNumber)
                .filePath(path)
                .expiryDate(expiryDate)
                .uploadedAt(java.time.OffsetDateTime.now())
                .build();

        // Sync expiry date to driver entity if it's a known compliance type
        if (expiryDate != null) {
            switch (type) {
                case LICENSE_COPY -> driver.setLicenseExpiry(expiryDate);
                case EMIRATES_ID_COPY -> driver.setEmiratesIdExpiry(expiryDate);
                case VISA_COPY -> driver.setVisaExpiry(expiryDate);
                default -> {}
            }
            driverRepository.save(driver);
        }

        com.example.multi_tanent.fleet.entity.DriverDocument saved = driverDocumentRepository.save(doc);
        return mapToDocumentResponse(saved);
    }

    @Transactional(readOnly = true)
    public java.util.List<com.example.multi_tanent.fleet.dtos.DriverDocumentResponse> getDocuments(Long driverId) {
        Tenant tenant = getCurrentTenant();
        return driverDocumentRepository.findByTenantIdAndDriverId(tenant.getId(), driverId).stream()
                .map(this::mapToDocumentResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private com.example.multi_tanent.fleet.dtos.DriverDocumentResponse mapToDocumentResponse(com.example.multi_tanent.fleet.entity.DriverDocument doc) {
        return com.example.multi_tanent.fleet.dtos.DriverDocumentResponse.builder()
                .id(doc.getId())
                .driverId(doc.getDriver().getId())
                .documentType(doc.getDocumentType())
                .documentNumber(doc.getDocumentNumber())
                .filePath(doc.getFilePath())
                .expiryDate(doc.getExpiryDate())
                .uploadedAt(doc.getUploadedAt())
                .build();
    }
}
