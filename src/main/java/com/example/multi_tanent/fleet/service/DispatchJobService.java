package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.fleet.dtos.DispatchAssignRequest;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.fleet.dtos.DispatchJobRequest;
import com.example.multi_tanent.fleet.dtos.DispatchJobResponse;
import com.example.multi_tanent.fleet.entity.DispatchJob;
import com.example.multi_tanent.fleet.enums.DeliveryStatus;
import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.entity.Vehicle;
import com.example.multi_tanent.fleet.enums.DriverStatus;
import com.example.multi_tanent.fleet.enums.VehicleStatus;
import com.example.multi_tanent.fleet.repository.DriverRepository;
import com.example.multi_tanent.fleet.repository.VehicleRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.fleet.entity.Trip;
import com.example.multi_tanent.fleet.entity.TripCustomer;
import com.example.multi_tanent.fleet.repository.TripCustomerRepository;
import com.example.multi_tanent.fleet.repository.TripRepository;
import com.example.multi_tanent.fleet.repository.DispatchJobRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class DispatchJobService {

    private final DispatchJobRepository dispatchJobRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final TripCustomerRepository customerRepository;
    private final TenantRepository tenantRepository;
    private final com.example.multi_tanent.warehouse.service.WareStorageService storageService;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    @Transactional
    public DispatchJobResponse createJob(DispatchJobRequest request) {
        Tenant tenant = getCurrentTenant();
        TripCustomer customer = customerRepository.findByIdAndTenantId(request.getCustomerId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));

        String jobNo = generateJobNo(tenant.getId());

        DispatchJob job = DispatchJob.builder()
                .tenant(tenant)
                .jobNo(jobNo)
                .jobDate(request.getJobDate())
                .customer(customer)
                .pickupLocation(request.getPickupLocation())
                .dropLocation(request.getDropLocation())
                .cargoDetails(request.getCargoDetails())
                .loadWeight(request.getLoadWeight())
                .priority(request.getPriority())
                .deliveryStatus(DeliveryStatus.PENDING)
                .remarks(request.getRemarks())
                .build();

        if (request.getLinkedTripId() != null) {
            Trip trip = tripRepository.findByIdAndTenantId(request.getLinkedTripId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Trip not found"));
            job.setLinkedTrip(trip);
        }

        return mapToResponse(dispatchJobRepository.save(job));
    }

    @Transactional
    public DispatchJobResponse assignResources(Long id, DispatchAssignRequest request) {
        Tenant tenant = getCurrentTenant();
        DispatchJob job = dispatchJobRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Dispatch Job not found"));

        Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(request.getVehicleId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vehicle not found"));

        Driver driver = driverRepository.findByIdAndEnterpriseId(request.getDriverId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Driver not found"));

        // Availability checks
        if (vehicle.getVehicleStatus() != VehicleStatus.ACTIVE) {
            throw new IllegalStateException("Vehicle is not available. Current status: " + vehicle.getVehicleStatus());
        }
        if (driver.getStatus() != DriverStatus.AVAILABLE) {
            throw new IllegalStateException("Driver is not available. Current status: " + driver.getStatus());
        }

        job.setAssignedVehicle(vehicle);
        job.setAssignedDriver(driver);
        job.setDeliveryStatus(DeliveryStatus.DISPATCHED);

        if (request.getTripId() != null) {
            Trip trip = tripRepository.findByIdAndTenantId(request.getTripId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Trip not found"));
            job.setLinkedTrip(trip);
            
            // Sync assignment back to trip if not already set
            trip.setVehicle(vehicle);
            trip.setDriver(driver);
            tripRepository.save(trip);
        } else if (job.getLinkedTrip() != null) {
            // Already linked, sync assignment
            Trip trip = job.getLinkedTrip();
            trip.setVehicle(vehicle);
            trip.setDriver(driver);
            tripRepository.save(trip);
        }

        return mapToResponse(dispatchJobRepository.save(job));
    }

    @Transactional
    public DispatchJobResponse updateStatus(Long id, DeliveryStatus status) {
        Tenant tenant = getCurrentTenant();
        DispatchJob job = dispatchJobRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Dispatch Job not found"));

        job.setDeliveryStatus(status);
        if (status == DeliveryStatus.DELIVERED) {
            job.setDeliveredAt(OffsetDateTime.now());
        }

        return mapToResponse(dispatchJobRepository.save(job));
    }

    public DispatchJobResponse uploadPod(Long id, org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        log.info("Starting POD upload process for dispatch job ID: {}", id);
        Tenant tenant = getCurrentTenant();
        
        // Store file first (Outside DB transaction)
        String path = storageService.storePodPhoto(file, tenant.getId().toString());
        log.info("POD photo successfully stored at: {}", path);

        return updateJobWithPod(id, path, tenant.getId());
    }

    @Transactional
    public DispatchJobResponse updateJobWithPod(Long id, String path, Long tenantId) {
        log.info("Updating database for dispatch job ID: {} with POD path", id);
        try {
            DispatchJob job = dispatchJobRepository.findByIdAndTenantId(id, tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Dispatch Job not found with ID: " + id));

            job.setProofOfDeliveryPath(path);
            job.setDeliveryStatus(DeliveryStatus.DELIVERED);
            job.setDeliveredAt(OffsetDateTime.now());

            // Save the job first so it's persisted (or at least flushable) before checking other jobs
            DispatchJob savedJob = dispatchJobRepository.save(job);
            log.info("Dispatch job {} updated successfully with POD", savedJob.getJobNo());

            // Auto-complete trip if all jobs are delivered
            if (savedJob.getLinkedTrip() != null) {
                Trip trip = savedJob.getLinkedTrip();
                var allJobs = dispatchJobRepository.findByTenantIdAndLinkedTripId(tenantId, trip.getId(), org.springframework.data.domain.Pageable.unpaged());
                
                // Check if all jobs for this trip are delivered
                boolean allDelivered = allJobs.getContent().stream()
                        .allMatch(j -> j.getDeliveryStatus() == DeliveryStatus.DELIVERED);
                
                // Only move status forward to DELIVERED if it's currently at an earlier stage
                if (allDelivered && trip.getTripStatus().ordinal() < com.example.multi_tanent.fleet.enums.TripStatus.DELIVERED.ordinal()) {
                    trip.setTripStatus(com.example.multi_tanent.fleet.enums.TripStatus.DELIVERED);
                    tripRepository.save(trip);
                    log.info("Trip {} status updated to DELIVERED as all jobs are delivered", trip.getTripNo());
                }
            }

            return mapToResponse(savedJob);
        } catch (Exception e) {
            log.error("Failed to update dispatch job {} with POD: {}", id, e.getMessage(), e);
            throw e;
        }
    }

    public Page<DispatchJobResponse> listJobs(DeliveryStatus status, Long tripId, String search, Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        if (tripId != null) {
            return dispatchJobRepository.findByTenantIdAndLinkedTripId(tenant.getId(), tripId, pageable)
                    .map(this::mapToResponse);
        }
        String query = null;
        if (search != null && !search.trim().isEmpty()) {
            query = "%" + search.trim().toLowerCase() + "%";
        }
        return dispatchJobRepository.findAllFiltered(tenant.getId(), status, query, pageable)
                .map(this::mapToResponse);
    }

    public DispatchJobResponse getJob(Long id) {
        Tenant tenant = getCurrentTenant();
        return dispatchJobRepository.findByIdAndTenantId(id, tenant.getId())
                .map(this::mapToResponse)
                .orElseThrow(() -> new EntityNotFoundException("Dispatch Job not found"));
    }

    public org.springframework.core.io.Resource loadDispatchFileAsResource(String path) {
        return storageService.loadFileAsResource(path);
    }


    private String generateJobNo(Long tenantId) {
        String maxJobNo = dispatchJobRepository.findMaxJobNoByTenantId(tenantId);
        int nextNum = 1;
        if (maxJobNo != null && maxJobNo.startsWith("DSP-")) {
            try {
                nextNum = Integer.parseInt(maxJobNo.substring(4)) + 1;
            } catch (NumberFormatException ignored) {}
        }
        return String.format("DSP-%05d", nextNum);
    }

    private DispatchJobResponse mapToResponse(DispatchJob job) {
        return DispatchJobResponse.builder()
                .id(job.getId())
                .jobNo(job.getJobNo())
                .jobDate(job.getJobDate())
                .customerId(job.getCustomer().getId())
                .customerName(job.getCustomer().getCompanyName())
                .pickupLocation(job.getPickupLocation())
                .dropLocation(job.getDropLocation())
                .cargoDetails(job.getCargoDetails())
                .loadWeight(job.getLoadWeight())
                .priority(job.getPriority())
                .assignedVehicleId(job.getAssignedVehicle() != null ? job.getAssignedVehicle().getId() : null)
                .assignedVehiclePlate(job.getAssignedVehicle() != null ? job.getAssignedVehicle().getPlateNumber() : null)
                .assignedDriverId(job.getAssignedDriver() != null ? job.getAssignedDriver().getId() : null)
                .assignedDriverName(job.getAssignedDriver() != null ? job.getAssignedDriver().getName() : null)
                .linkedTripId(job.getLinkedTrip() != null ? job.getLinkedTrip().getId() : null)
                .linkedTripNo(job.getLinkedTrip() != null ? String.valueOf(job.getLinkedTrip().getTripNo()) : null)
                .deliveryStatus(job.getDeliveryStatus())
                .proofOfDeliveryPath(job.getProofOfDeliveryPath())
                .deliveredAt(job.getDeliveredAt())
                .remarks(job.getRemarks())
                .createdAt(job.getCreatedAt())
                .build();
    }
}
