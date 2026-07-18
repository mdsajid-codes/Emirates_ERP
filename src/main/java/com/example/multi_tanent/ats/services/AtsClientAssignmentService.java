package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsClientAssignmentRequest;
import com.example.multi_tanent.ats.dto.AtsClientAssignmentResponse;
import com.example.multi_tanent.ats.entity.AtsClient;
import com.example.multi_tanent.ats.entity.AtsClientAssignment;
import com.example.multi_tanent.ats.repository.AtsClientAssignmentRepository;
import com.example.multi_tanent.ats.repository.AtsClientRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsClientAssignmentService {

    private final AtsClientAssignmentRepository assignmentRepository;
    private final AtsClientRepository clientRepository;
    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientAssignmentResponse get(Long clientId) {
        Tenant tenant = currentTenant();
        return assignmentRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .map(this::toResponse)
                .orElse(null);
    }

    public AtsClientAssignmentResponse upsert(Long clientId, AtsClientAssignmentRequest request) {
        Tenant tenant = currentTenant();
        AtsClient client = clientRepository.findByIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + clientId));

        Optional<AtsClientAssignment> existingOpt = assignmentRepository.findByClientIdAndTenantId(clientId, tenant.getId());

        AtsClientAssignment assignment = existingOpt.orElseGet(() -> AtsClientAssignment.builder()
                .tenant(tenant)
                .client(client)
                .build());

        // Resolve single employee relations
        assignment.setSalesManager(resolveEmployee(request.getSalesManagerId(), tenant.getId()));
        assignment.setAccountManager(resolveEmployee(request.getAccountManagerId(), tenant.getId()));
        assignment.setRecruitmentManager(resolveEmployee(request.getRecruitmentManagerId(), tenant.getId()));
        assignment.setSecondarySalesManager(resolveEmployee(request.getSecondarySalesManagerId(), tenant.getId()));
        assignment.setSecondaryRecruitmentManager(resolveEmployee(request.getSecondaryRecruitmentManagerId(), tenant.getId()));

        // Resolve list employee relations
        assignment.setAssignedToUsers(resolveEmployees(request.getAssignedToUserIds(), tenant.getId()));
        assignment.setTatNotificationRecipients(resolveEmployees(request.getTatNotificationRecipientIds(), tenant.getId()));

        // Resolve scalar fields
        assignment.setDefaultTatDays(request.getDefaultTatDays());
        assignment.setDefaultTaxTerm(request.getDefaultTaxTerm());
        assignment.setDefaultWorkAuthorization(request.getDefaultWorkAuthorization());
        assignment.setDefaultPayRateTaxTerm(request.getDefaultPayRateTaxTerm());
        assignment.setDefaultBillRateTaxTerm(request.getDefaultBillRateTaxTerm());
        assignment.setPostJobInCareerPortal(request.getPostJobInCareerPortal() != null ? request.getPostJobInCareerPortal() : false);
        assignment.setMakeReferencesMandatory(request.getMakeReferencesMandatory() != null ? request.getMakeReferencesMandatory() : false);
        assignment.setMaxSubmissions(request.getMaxSubmissions());
        assignment.setNumberOfPositions(request.getNumberOfPositions());

        AtsClientAssignment saved = assignmentRepository.save(assignment);
        return toResponse(saved);
    }

    public void delete(Long clientId) {
        Tenant tenant = currentTenant();
        AtsClientAssignment assignment = assignmentRepository.findByClientIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Assignment not found for client id: " + clientId));
        assignmentRepository.delete(assignment);
    }

    private Employee resolveEmployee(Long id, Long tenantId) {
        if (id == null) return null;
        return employeeRepository.findByIdAndUser_Tenant_Id(id, tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + id));
    }

    private List<Employee> resolveEmployees(List<Long> ids, Long tenantId) {
        if (ids == null || ids.isEmpty()) return new ArrayList<>();
        List<Employee> list = new ArrayList<>();
        for (Long id : ids) {
            list.add(resolveEmployee(id, tenantId));
        }
        return list;
    }

    public AtsClientAssignmentResponse toResponse(AtsClientAssignment a) {
        return AtsClientAssignmentResponse.builder()
                .id(a.getId())
                .clientId(a.getClient().getId())
                .assignedToUsers(a.getAssignedToUsers().stream()
                        .map(e -> AtsClientAssignmentResponse.EmployeeRef.builder()
                                .id(e.getId())
                                .name(e.getFirstName() + " " + e.getLastName())
                                .build())
                        .collect(Collectors.toList()))
                .salesManagerId(a.getSalesManager() != null ? a.getSalesManager().getId() : null)
                .salesManagerName(a.getSalesManager() != null ? 
                        (a.getSalesManager().getFirstName() + " " + a.getSalesManager().getLastName()) : null)
                .accountManagerId(a.getAccountManager() != null ? a.getAccountManager().getId() : null)
                .accountManagerName(a.getAccountManager() != null ? 
                        (a.getAccountManager().getFirstName() + " " + a.getAccountManager().getLastName()) : null)
                .recruitmentManagerId(a.getRecruitmentManager() != null ? a.getRecruitmentManager().getId() : null)
                .recruitmentManagerName(a.getRecruitmentManager() != null ? 
                        (a.getRecruitmentManager().getFirstName() + " " + a.getRecruitmentManager().getLastName()) : null)
                .secondarySalesManagerId(a.getSecondarySalesManager() != null ? a.getSecondarySalesManager().getId() : null)
                .secondarySalesManagerName(a.getSecondarySalesManager() != null ? 
                        (a.getSecondarySalesManager().getFirstName() + " " + a.getSecondarySalesManager().getLastName()) : null)
                .secondaryRecruitmentManagerId(a.getSecondaryRecruitmentManager() != null ? a.getSecondaryRecruitmentManager().getId() : null)
                .secondaryRecruitmentManagerName(a.getSecondaryRecruitmentManager() != null ? 
                        (a.getSecondaryRecruitmentManager().getFirstName() + " " + a.getSecondaryRecruitmentManager().getLastName()) : null)
                .defaultTatDays(a.getDefaultTatDays())
                .tatNotificationRecipients(a.getTatNotificationRecipients().stream()
                        .map(e -> AtsClientAssignmentResponse.EmployeeRef.builder()
                                .id(e.getId())
                                .name(e.getFirstName() + " " + e.getLastName())
                                .build())
                        .collect(Collectors.toList()))
                .defaultTaxTerm(a.getDefaultTaxTerm())
                .defaultWorkAuthorization(a.getDefaultWorkAuthorization())
                .defaultPayRateTaxTerm(a.getDefaultPayRateTaxTerm())
                .defaultBillRateTaxTerm(a.getDefaultBillRateTaxTerm())
                .postJobInCareerPortal(a.getPostJobInCareerPortal())
                .makeReferencesMandatory(a.getMakeReferencesMandatory())
                .maxSubmissions(a.getMaxSubmissions())
                .numberOfPositions(a.getNumberOfPositions())
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
