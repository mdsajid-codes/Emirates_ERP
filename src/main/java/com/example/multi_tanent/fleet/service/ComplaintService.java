package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.fleet.dtos.ComplaintRequest;
import com.example.multi_tanent.fleet.dtos.ComplaintResponse;
import com.example.multi_tanent.fleet.entity.Complaint;
import com.example.multi_tanent.fleet.entity.Driver;
import com.example.multi_tanent.fleet.entity.Vehicle;
import com.example.multi_tanent.fleet.enums.ComplaintStatus;
import com.example.multi_tanent.fleet.enums.RiskLevel;
import com.example.multi_tanent.fleet.repository.ComplaintRepository;
import com.example.multi_tanent.fleet.repository.DriverRepository;
import com.example.multi_tanent.fleet.repository.VehicleRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.fleet.entity.Trip;
import com.example.multi_tanent.fleet.repository.TripRepository;
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
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final TenantRepository tenantRepository;
    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final UserRepository userRepository;

    private static final String UPLOAD_DIR = "uploads/fleet/complaint";

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
    }

    @Transactional
    public ComplaintResponse createComplaint(ComplaintRequest request) {
        Tenant tenant = getCurrentTenant();

        Complaint complaint = new Complaint();
        complaint.setTenant(tenant);
        
        mapRequestToEntity(request, complaint, tenant);
        
        // Auto-generate code if not present
        if (complaint.getComplaintCode() == null || complaint.getComplaintCode().isEmpty()) {
            complaint.setComplaintCode(generateComplaintCode(tenant.getId()));
        }
        
        // New complaints are always OPEN
        if (complaint.getStatus() == null) {
            complaint.setStatus(ComplaintStatus.OPEN);
        }

        return mapToResponse(complaintRepository.save(complaint));
    }

    @Transactional(readOnly = true)
    public Page<ComplaintResponse> listAll(ComplaintStatus status, RiskLevel riskLevel, String search, Pageable pageable) {
        try {
            Tenant tenant = getCurrentTenant();
            log.info("Fetching complaints for tenant: {}, status: {}, riskLevel: {}, search: {}", tenant.getId(), status, riskLevel, search);
            String query = null;
            if (search != null && !search.trim().isEmpty()) {
                query = "%" + search.trim().toLowerCase() + "%";
            }
            Page<Complaint> complaints = complaintRepository.findByTenantIdAndFiltersWithDetails(tenant.getId(), status, riskLevel, query, pageable);
            log.info("Found {} complaints", complaints.getTotalElements());
            return complaints.map(this::mapToResponse);
        } catch (Exception e) {
            log.error("Error listing complaints: ", e);
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public ComplaintResponse getComplaint(Long id) {
        Tenant tenant = getCurrentTenant();
        Complaint complaint = complaintRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Complaint not found"));

        if (!complaint.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintResponse updateComplaint(Long id, ComplaintRequest request) {
        Tenant tenant = getCurrentTenant();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Complaint not found"));

        if (!complaint.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        mapRequestToEntity(request, complaint, tenant);

        return mapToResponse(complaintRepository.save(complaint));
    }

    @Transactional
    public void deleteComplaint(Long id) {
        Tenant tenant = getCurrentTenant();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Complaint not found"));

        if (!complaint.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        complaintRepository.delete(complaint);
    }

    @Transactional
    public ComplaintResponse uploadAttachment(Long id, MultipartFile file) throws IOException {
        Tenant tenant = getCurrentTenant();
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Complaint not found"));

        if (!complaint.getTenant().getId().equals(tenant.getId())) {
            throw new IllegalArgumentException("Access denied");
        }

        if (file != null && !file.isEmpty()) {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR, tenant.getId().toString(), id.toString());
            Files.createDirectories(path);
            Path filePath = path.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);
            complaint.setAttachmentPath(filePath.toString());
            return mapToResponse(complaintRepository.save(complaint));
        }

        return mapToResponse(complaint);
    }

    private void mapRequestToEntity(ComplaintRequest request, Complaint complaint, Tenant tenant) {
        complaint.setReportedDate(request.getReportedDate());
        complaint.setReportedByType(request.getReportedByType());
        complaint.setReportedById(request.getReportedById());
        complaint.setType(request.getType());
        complaint.setCategory(request.getCategory());
        complaint.setDescription(request.getDescription());
        complaint.setRiskLevel(request.getRiskLevel());
        
        if (request.getStatus() != null) {
            complaint.setStatus(request.getStatus());
        }
        
        complaint.setResolutionNotes(request.getResolutionNotes());

        if (request.getTripId() != null) {
            Trip trip = tripRepository.findById(request.getTripId())
                    .orElseThrow(() -> new EntityNotFoundException("Trip not found"));
            complaint.setTrip(trip);
        } else {
            complaint.setTrip(null);
        }

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findByIdAndEnterpriseId(request.getVehicleId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Vehicle not found"));
            complaint.setVehicle(vehicle);
        } else {
            complaint.setVehicle(null);
        }

        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findByIdAndEnterpriseId(request.getDriverId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Driver not found"));
            complaint.setDriver(driver);
        } else {
            complaint.setDriver(null);
        }

        if (request.getAssignedToId() != null) {
            User user = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new EntityNotFoundException("Assigned user not found"));
            complaint.setAssignedTo(user);
        } else {
            complaint.setAssignedTo(null);
        }
    }

    private ComplaintResponse mapToResponse(Complaint c) {
        ComplaintResponse response = new ComplaintResponse();
        response.setId(c.getId());
        response.setComplaintCode(c.getComplaintCode());
        response.setReportedDate(c.getReportedDate());
        response.setReportedByType(c.getReportedByType());
        response.setReportedById(c.getReportedById());
        response.setType(c.getType());
        response.setCategory(c.getCategory());
        
        if (c.getTrip() != null) {
            response.setTripId(c.getTrip().getId());
            response.setTripNo(String.valueOf(c.getTrip().getTripNo()));
        }
        
        if (c.getVehicle() != null) {
            response.setVehicleId(c.getVehicle().getId());
            response.setVehiclePlateNumber(c.getVehicle().getPlateNumber());
        }
        
        if (c.getDriver() != null) {
            response.setDriverId(c.getDriver().getId());
            response.setDriverName(c.getDriver().getName());
        }
        
        response.setDescription(c.getDescription());
        response.setRiskLevel(c.getRiskLevel());
        response.setStatus(c.getStatus());
        
        if (c.getAssignedTo() != null) {
            response.setAssignedToId(c.getAssignedTo().getId());
            response.setAssignedToName(c.getAssignedTo().getName());
        }
        
        response.setResolutionNotes(c.getResolutionNotes());
        response.setAttachmentPath(c.getAttachmentPath());
        
        return response;
    }

    private String generateComplaintCode(Long tenantId) {
        long count = complaintRepository.countByTenantId(tenantId);
        String year = String.valueOf(java.time.Year.now().getValue());
        return String.format("CMP-%s-%04d", year, count + 1);
    }
}
