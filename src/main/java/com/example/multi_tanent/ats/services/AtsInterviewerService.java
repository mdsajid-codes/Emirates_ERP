package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsInterviewerRequest;
import com.example.multi_tanent.ats.dto.AtsInterviewerResponse;
import com.example.multi_tanent.ats.entity.AtsBusinessUnit;
import com.example.multi_tanent.ats.entity.AtsInterviewer;
import com.example.multi_tanent.ats.repository.AtsBusinessUnitRepository;
import com.example.multi_tanent.ats.repository.AtsInterviewerRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsInterviewerService {

    private final AtsInterviewerRepository interviewerRepository;
    private final AtsBusinessUnitRepository businessUnitRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    private String currentUsername() {
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            return SecurityContextHolder.getContext().getAuthentication().getName();
        }
        return "Admin";
    }

    public AtsInterviewerResponse create(AtsInterviewerRequest request) {
        Tenant tenant = currentTenant();

        if (interviewerRepository.existsByEmailAndTenantId(request.getEmail(), tenant.getId())) {
            throw new IllegalArgumentException("An interviewer with email '" + request.getEmail() + "' already exists for this tenant.");
        }

        AtsBusinessUnit businessUnit = null;
        if (request.getBusinessUnitId() != null) {
            businessUnit = businessUnitRepository.findByIdAndTenantId(request.getBusinessUnitId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Business Unit not found with id: " + request.getBusinessUnitId()));
        }

        AtsInterviewer interviewer = AtsInterviewer.builder()
                .tenant(tenant)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .jobTitle(request.getJobTitle())
                .mobileNumber(request.getMobileNumber())
                .technology(request.getTechnology())
                .businessUnit(businessUnit)
                .calendarSyncNotification(request.getCalendarSyncNotification() != null ? request.getCalendarSyncNotification() : true)
                .workingHoursStart(request.getWorkingHoursStart())
                .workingHoursEnd(request.getWorkingHoursEnd())
                .workingHoursApplyWeekends(request.getWorkingHoursApplyWeekends() != null ? request.getWorkingHoursApplyWeekends() : false)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .createdBy(currentUsername())
                .build();

        AtsInterviewer saved = interviewerRepository.save(interviewer);
        return toResponse(saved);
    }

    public AtsInterviewerResponse update(Long id, AtsInterviewerRequest request) {
        Tenant tenant = currentTenant();
        AtsInterviewer interviewer = interviewerRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Interviewer not found with id: " + id));

        if (!interviewer.getEmail().equalsIgnoreCase(request.getEmail()) &&
                interviewerRepository.existsByEmailAndTenantId(request.getEmail(), tenant.getId())) {
            throw new IllegalArgumentException("An interviewer with email '" + request.getEmail() + "' already exists for this tenant.");
        }

        AtsBusinessUnit businessUnit = null;
        if (request.getBusinessUnitId() != null) {
            businessUnit = businessUnitRepository.findByIdAndTenantId(request.getBusinessUnitId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Business Unit not found with id: " + request.getBusinessUnitId()));
        }

        interviewer.setFirstName(request.getFirstName());
        interviewer.setLastName(request.getLastName());
        interviewer.setEmail(request.getEmail());
        interviewer.setJobTitle(request.getJobTitle());
        interviewer.setMobileNumber(request.getMobileNumber());
        interviewer.setTechnology(request.getTechnology());
        interviewer.setBusinessUnit(businessUnit);
        if (request.getCalendarSyncNotification() != null) {
            interviewer.setCalendarSyncNotification(request.getCalendarSyncNotification());
        }
        interviewer.setWorkingHoursStart(request.getWorkingHoursStart());
        interviewer.setWorkingHoursEnd(request.getWorkingHoursEnd());
        if (request.getWorkingHoursApplyWeekends() != null) {
            interviewer.setWorkingHoursApplyWeekends(request.getWorkingHoursApplyWeekends());
        }
        if (request.getIsActive() != null) {
            interviewer.setIsActive(request.getIsActive());
        }

        AtsInterviewer updated = interviewerRepository.save(interviewer);
        return toResponse(updated);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsInterviewerResponse> getPage(String search, Pageable pageable) {
        Tenant tenant = currentTenant();
        if (search != null && !search.trim().isEmpty()) {
            return interviewerRepository.searchInterviewers(tenant.getId(), search.trim(), pageable).map(this::toResponse);
        }
        return interviewerRepository.findByTenantId(tenant.getId(), pageable).map(this::toResponse);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsInterviewerResponse getById(Long id) {
        Tenant tenant = currentTenant();
        AtsInterviewer interviewer = interviewerRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Interviewer not found with id: " + id));
        return toResponse(interviewer);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsInterviewer interviewer = interviewerRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Interviewer not found with id: " + id));
        interviewerRepository.delete(interviewer);
    }

    public AtsInterviewerResponse toggleActive(Long id) {
        Tenant tenant = currentTenant();
        AtsInterviewer interviewer = interviewerRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Interviewer not found with id: " + id));
        interviewer.setIsActive(!interviewer.getIsActive());
        AtsInterviewer updated = interviewerRepository.save(interviewer);
        return toResponse(updated);
    }

    private AtsInterviewerResponse toResponse(AtsInterviewer interviewer) {
        return AtsInterviewerResponse.builder()
                .id(interviewer.getId())
                .firstName(interviewer.getFirstName())
                .lastName(interviewer.getLastName())
                .email(interviewer.getEmail())
                .jobTitle(interviewer.getJobTitle())
                .mobileNumber(interviewer.getMobileNumber())
                .technology(interviewer.getTechnology())
                .businessUnitId(interviewer.getBusinessUnit() != null ? interviewer.getBusinessUnit().getId() : null)
                .businessUnitName(interviewer.getBusinessUnit() != null ? interviewer.getBusinessUnit().getName() : "N/A")
                .calendarSyncNotification(interviewer.getCalendarSyncNotification())
                .workingHoursStart(interviewer.getWorkingHoursStart())
                .workingHoursEnd(interviewer.getWorkingHoursEnd())
                .workingHoursApplyWeekends(interviewer.getWorkingHoursApplyWeekends())
                .isActive(interviewer.getIsActive())
                .createdBy(interviewer.getCreatedBy() != null ? interviewer.getCreatedBy() : "Admin")
                .createdAt(interviewer.getCreatedAt())
                .updatedAt(interviewer.getUpdatedAt())
                .build();
    }
}
