package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmActivitySummaryDto;
import com.example.multi_tanent.crm.dto.CrmAuditLogDto;
import com.example.multi_tanent.crm.dto.CrmGroupedCountDto;
import com.example.multi_tanent.crm.entity.CrmAuditLog;
import com.example.multi_tanent.crm.repository.*;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(value = "tenantTx", readOnly = true)
public class CrmReportService {

    private final CrmLeadRepository leadRepository;
    private final CrmCallLogRepository callLogRepository;
    private final CrmTaskRepository taskRepository;
    private final CrmEmailRepository emailRepository;
    private final CrmAuditLogRepository auditLogRepository;
    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public List<CrmGroupedCountDto> getLeadsByStage() {
        Tenant tenant = currentTenant();
        List<Object[]> results = leadRepository.countByStage(tenant.getId());
        return results.stream()
                .map(r -> new CrmGroupedCountDto((String) r[0], (Long) r[1]))
                .collect(Collectors.toList());
    }

    public List<CrmGroupedCountDto> getLeadsByOwner() {
        Tenant tenant = currentTenant();
        List<Object[]> results = leadRepository.countByOwner(tenant.getId());
        return results.stream()
                .map(r -> new CrmGroupedCountDto((String) r[0], (Long) r[1]))
                .collect(Collectors.toList());
    }

    public List<CrmGroupedCountDto> getLeadsByStatus() {
        Tenant tenant = currentTenant();
        List<Object[]> results = leadRepository.countByStatus(tenant.getId());
        return results.stream()
                .map(r -> new CrmGroupedCountDto((String) r[0], (Long) r[1]))
                .collect(Collectors.toList());
    }

    public List<CrmActivitySummaryDto> getActivitySummary() {
        Tenant tenant = currentTenant();
        List<Employee> employees = employeeRepository.findByUser_Tenant_Id(tenant.getId());

        List<CrmActivitySummaryDto> summaries = new ArrayList<>();
        for (Employee emp : employees) {
            String name = emp.getFirstName() + " " + emp.getLastName();

            // Count calls, tasks, emails
            long calls = callLogRepository.findByTenantIdAndEmployeeId(tenant.getId(), emp.getId(), Pageable.unpaged()).getTotalElements();
            
            // To get task and email counts, use EntityManager or standard query patterns
            // Since we can count directly, let's write count methods or execute simple queries
            // To keep it safe and DB agnostic:
            long tasks = taskRepository.countByTenantIdAndAssignedToId(tenant.getId(), emp.getId());
            long emails = emailRepository.countByTenantIdAndSentById(tenant.getId(), emp.getId());

            summaries.add(CrmActivitySummaryDto.builder()
                    .employeeName(name)
                    .calls(calls)
                    .tasks(tasks)
                    .emailsSent(emails)
                    .build());
        }
        return summaries;
    }

    public Page<CrmAuditLogDto> getAuditLog(String action, String entityType, LocalDate fromDate, LocalDate toDate, Pageable pageable) {
        Tenant tenant = currentTenant();
        Specification<CrmAuditLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenantId"), tenant.getId()));

            if (action != null && !action.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("action")), "%" + action.toLowerCase() + "%"));
            }
            if (entityType != null && !entityType.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("entityType")), entityType.toUpperCase()));
            }
            if (fromDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("performedAt"), fromDate.atStartOfDay().atOffset(ZoneOffset.UTC)));
            }
            if (toDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("performedAt"), toDate.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC)));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return auditLogRepository.findAll(spec, pageable).map(this::toAuditLogDto);
    }

    private CrmAuditLogDto toAuditLogDto(CrmAuditLog entry) {
        return CrmAuditLogDto.builder()
                .id(entry.getId())
                .action(entry.getAction())
                .entityType(entry.getEntityType())
                .entityId(entry.getEntityId())
                .description(entry.getDescription())
                .performedBy(entry.getPerformedByEmail())
                .performedAt(entry.getPerformedAt())
                .build();
    }
}
