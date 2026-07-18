package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsApplicantEmployerRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantEmployerResponse;
import com.example.multi_tanent.ats.entity.AtsApplicant;
import com.example.multi_tanent.ats.entity.AtsApplicantEmployer;
import com.example.multi_tanent.ats.entity.AtsApplicantEmployer.EmployerMode;
import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.repository.AtsApplicantEmployerRepository;
import com.example.multi_tanent.ats.repository.AtsApplicantRepository;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsApplicantEmployerService {

    private final AtsApplicantEmployerRepository employerRepository;
    private final AtsApplicantRepository applicantRepository;
    private final AtsVendorRepository vendorRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsApplicantEmployerResponse create(Long applicantId, AtsApplicantEmployerRequest request) {
        Tenant tenant = currentTenant();

        AtsApplicant applicant = applicantRepository.findByIdAndTenantId(applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant not found with id: " + applicantId));

        AtsVendor vendor = null;
        if (request.getMode() == EmployerMode.EXISTING) {
            if (request.getVendorId() == null) {
                throw new IllegalArgumentException("Vendor id is required for EXISTING mode");
            }
            vendor = vendorRepository.findByIdAndTenantId(request.getVendorId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id: " + request.getVendorId()));
        }

        AtsApplicantEmployer employer = AtsApplicantEmployer.builder()
                .tenant(tenant)
                .applicant(applicant)
                .mode(request.getMode())
                .vendor(vendor)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .employerName(request.getEmployerName())
                .officeNumber(request.getOfficeNumber())
                .officeExtension(request.getOfficeExtension())
                .email(request.getEmail())
                .mobileNumber(request.getMobileNumber())
                .status(request.getStatus())
                .build();

        AtsApplicantEmployer saved = employerRepository.save(employer);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsApplicantEmployerResponse> getAllForApplicant(Long applicantId) {
        Tenant tenant = currentTenant();
        if (!applicantRepository.existsById(applicantId)) {
            throw new EntityNotFoundException("Applicant not found with id: " + applicantId);
        }
        return employerRepository.findByApplicantIdAndTenantId(applicantId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsApplicantEmployerResponse getById(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        return employerRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Applicant employer not found with id: " + id));
    }

    public AtsApplicantEmployerResponse update(Long applicantId, Long id, AtsApplicantEmployerRequest request) {
        Tenant tenant = currentTenant();
        AtsApplicantEmployer employer = employerRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant employer not found with id: " + id));

        AtsVendor vendor = null;
        if (request.getMode() == EmployerMode.EXISTING) {
            if (request.getVendorId() == null) {
                throw new IllegalArgumentException("Vendor id is required for EXISTING mode");
            }
            vendor = vendorRepository.findByIdAndTenantId(request.getVendorId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id: " + request.getVendorId()));
        }

        employer.setMode(request.getMode());
        employer.setVendor(vendor);
        employer.setFirstName(request.getFirstName());
        employer.setLastName(request.getLastName());
        employer.setEmployerName(request.getEmployerName());
        employer.setOfficeNumber(request.getOfficeNumber());
        employer.setOfficeExtension(request.getOfficeExtension());
        employer.setEmail(request.getEmail());
        employer.setMobileNumber(request.getMobileNumber());
        employer.setStatus(request.getStatus());

        AtsApplicantEmployer updated = employerRepository.save(employer);
        return toResponse(updated);
    }

    public void delete(Long applicantId, Long id) {
        Tenant tenant = currentTenant();
        AtsApplicantEmployer employer = employerRepository.findByIdAndApplicantIdAndTenantId(id, applicantId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Applicant employer not found with id: " + id));
        employerRepository.delete(employer);
    }

    public AtsApplicantEmployerResponse toResponse(AtsApplicantEmployer employer) {
        Long vendorId = null;
        String vendorName = null;
        if (employer.getVendor() != null) {
            vendorId = employer.getVendor().getId();
            vendorName = employer.getVendor().getCompanyName();
        }

        return AtsApplicantEmployerResponse.builder()
                .id(employer.getId())
                .applicantId(employer.getApplicant().getId())
                .mode(employer.getMode())
                .firstName(employer.getFirstName())
                .lastName(employer.getLastName())
                .employerName(employer.getEmployerName())
                .officeNumber(employer.getOfficeNumber())
                .officeExtension(employer.getOfficeExtension())
                .email(employer.getEmail())
                .mobileNumber(employer.getMobileNumber())
                .status(employer.getStatus())
                .vendorId(vendorId)
                .vendorName(vendorName)
                .createdAt(employer.getCreatedAt())
                .updatedAt(employer.getUpdatedAt())
                .build();
    }
}
