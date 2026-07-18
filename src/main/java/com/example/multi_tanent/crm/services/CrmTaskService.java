// package com.example.multi_tanent.crm.services;


// import com.example.multi_tanent.crm.dto.CrmTaskRequest;
// import com.example.multi_tanent.crm.dto.CrmTaskResponse;
// import com.example.multi_tanent.crm.dto.SimpleIdNameDto;
// import com.example.multi_tanent.crm.entity.*;
// import com.example.multi_tanent.crm.repository.ContactRepository;
// import com.example.multi_tanent.crm.repository.CrmTaskRepository;
// import com.example.multi_tanent.pos.repository.TenantRepository;
// import com.example.multi_tanent.spersusers.enitity.Employee;
// import com.example.multi_tanent.spersusers.enitity.Tenant;
// import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
// import com.example.multi_tanent.config.TenantContext;

// import jakarta.persistence.EntityNotFoundException;
// import lombok.RequiredArgsConstructor;
// import org.springframework.stereotype.Service;
// import org.springframework.transaction.annotation.Transactional;

// import java.time.format.DateTimeFormatter;
// import java.util.*;
// import java.util.stream.Collectors;

// @Service
// @RequiredArgsConstructor
// @Transactional("tenantTx")
// public class CrmTaskService {

//     private final CrmTaskRepository taskRepo;
//     private final TenantRepository tenantRepo;

//     // Repositories you already have:
//     private final EmployeeRepository employeeRepository;
//     private final ContactRepository contactRepository;

//     private Tenant currentTenant() {
//         String key = TenantContext.getTenantId();
//         return tenantRepo.findFirstByOrderByIdAsc()
//                 .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
//     }

//     @Transactional(readOnly = true)
//     public List<CrmTaskResponse> getAll() {
//         Tenant t = currentTenant();
//         return taskRepo.findByTenantIdOrderByDueDateAscIdAsc(t.getId())
//                 .stream().map(this::toResponse).toList();
//     }

//     @Transactional(readOnly = true)
//     public CrmTaskResponse getById(Long id) {
//         Tenant t = currentTenant();
//         CrmTask e = taskRepo.findByIdAndTenantId(id, t.getId())
//                 .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
//         return toResponse(e);
//     }

//     public CrmTaskResponse create(CrmTaskRequest req) {
//         Tenant t = currentTenant();

//         CrmTask e = CrmTask.builder()
//                 .tenant(t)
//                 .subject(req.getSubject())
//                 .comments(req.getComments())
//                 .dueDate(req.getDueDate())
//                 .callTime(req.getCallTime())
//                 .status(req.getStatus())
//                 .build();

//         if (req.getAssignedToEmployeeId() != null) {
//             Employee assignee = employeeRepository.findById(req.getAssignedToEmployeeId())
//                     .orElseThrow(() -> new EntityNotFoundException("Assignee not found: " + req.getAssignedToEmployeeId()));
//             e.setAssignedTo(assignee);
//         }

//         if (req.getEmployeeIds() != null && !req.getEmployeeIds().isEmpty()) {
//             Set<Employee> emps = new LinkedHashSet<>(employeeRepository.findAllById(req.getEmployeeIds()));
//             e.setEmployees(emps);
//         }

//         if (req.getContactIds() != null && !req.getContactIds().isEmpty()) {
//             Set<Contact> cons = new LinkedHashSet<>(contactRepository.findAllById(req.getContactIds()));
//             e.setContacts(cons);
//         }

//         return toResponse(taskRepo.save(e));
//     }

//     public CrmTaskResponse update(Long id, CrmTaskRequest req) {
//         Tenant t = currentTenant();
//         CrmTask e = taskRepo.findByIdAndTenantId(id, t.getId())
//                 .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));

//         if (req.getSubject() != null) e.setSubject(req.getSubject());
//         e.setComments(req.getComments());
//         e.setDueDate(req.getDueDate());
//         e.setCallTime(req.getCallTime());
//         e.setStatus(req.getStatus());

//         if (req.getAssignedToEmployeeId() != null) {
//             Employee assignee = employeeRepository.findById(req.getAssignedToEmployeeId())
//                     .orElseThrow(() -> new EntityNotFoundException("Assignee not found: " + req.getAssignedToEmployeeId()));
//             e.setAssignedTo(assignee);
//         } else {
//             e.setAssignedTo(null);
//         }

//         // Replace sets when provided
//         if (req.getEmployeeIds() != null) {
//             Set<Employee> emps = new LinkedHashSet<>(employeeRepository.findAllById(req.getEmployeeIds()));
//             e.setEmployees(emps);
//         }
//         if (req.getContactIds() != null) {
//             Set<Contact> cons = new LinkedHashSet<>(contactRepository.findAllById(req.getContactIds()));
//             e.setContacts(cons);
//         }

//         return toResponse(taskRepo.save(e));
//     }

//     public void delete(Long id) {
//         Tenant t = currentTenant();
//         CrmTask e = taskRepo.findByIdAndTenantId(id, t.getId())
//                 .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
//         taskRepo.delete(e);
//     }

//     /* ------------ helpers ------------ */

//     private CrmTaskResponse toResponse(CrmTask e) {
//         return CrmTaskResponse.builder()
//                 .id(e.getId())
//                 .tenantId(e.getTenant() != null ? e.getTenant().getId() : null)
//                 .subject(e.getSubject())
//                 .comments(e.getComments())
//                 .dueDate(e.getDueDate())
//                 .callTime(e.getCallTime())
//                 .assignedToId(e.getAssignedTo() != null ? e.getAssignedTo().getId() : null)
//                 .assignedToName(e.getAssignedTo() != null ? safeName(e.getAssignedTo().getFirstName() + " " + e.getAssignedTo().getLastName()) : null)
//                 .employees(e.getEmployees().stream()
//                         .map(emp -> new SimpleIdNameDto(emp.getId(), safeName(emp.getFirstName() + " " + emp.getLastName())))
//                         .collect(Collectors.toList()))
//                 .contacts(e.getContacts().stream()
//                         .map(c -> new SimpleIdNameDto(c.getId(), safeName(c.getFullName())))
//                         .collect(Collectors.toList()))
//                 .status(e.getStatus())
//                 .createdAt(e.getCreatedAt() != null ? DateTimeFormatter.ISO_INSTANT.format(e.getCreatedAt()) : null)
//                 .updatedAt(e.getUpdatedAt() != null ? DateTimeFormatter.ISO_INSTANT.format(e.getUpdatedAt()) : null)
//                 .build();
//     }

//     private String safeName(String s) { return s == null ? "" : s; }
// }
package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmTaskRequest;
import com.example.multi_tanent.crm.dto.CrmTaskResponse;
import com.example.multi_tanent.crm.dto.SimpleIdNameDto;
import com.example.multi_tanent.crm.entity.CrmLead;
import com.example.multi_tanent.crm.entity.Contact;
import com.example.multi_tanent.crm.entity.CrmTask;
import com.example.multi_tanent.crm.repository.CrmLeadRepository;
import com.example.multi_tanent.crm.repository.ContactRepository;
import com.example.multi_tanent.crm.repository.CrmTaskRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmTaskService {

    private final CrmTaskRepository taskRepo;
    private final TenantRepository tenantRepo;

    private final EmployeeRepository employeeRepository;
    private final CrmLeadRepository leadRepository;
    private final ContactRepository contactRepository;
    private final CrmAccessService crmAccessService;

    private Tenant currentTenant() {
        // If you resolve tenant differently, adapt here.
        String key = TenantContext.getTenantId();
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    @Transactional(readOnly = true)
    public List<CrmTaskResponse> getAll() {
        Tenant t = currentTenant();
        if (crmAccessService.isOwnerOnly("TASK")) {
            Long empId = crmAccessService.getCurrentEmployeeId();
            return taskRepo.findByTenantIdAndAssignedToIdOrderByDueDateAscIdAsc(t.getId(), empId)
                    .stream().map(this::toResponse).toList();
        }
        return taskRepo.findByTenantIdOrderByDueDateAscIdAsc(t.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CrmTaskResponse getById(Long id) {
        Tenant t = currentTenant();
        CrmTask e = taskRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
        return toResponse(e);
    }

    @Transactional(readOnly = true)
    public List<CrmTaskResponse> getTasksByLeadId(Long leadId) {
        Tenant t = currentTenant();
        // Ensure the lead exists for the current tenant before fetching tasks
        leadRepository.findByIdAndTenantId(leadId, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));

        return taskRepo.findByTenantIdAndLeadIdOrderByDueDateAscIdAsc(t.getId(), leadId)
                .stream().map(this::toResponse).toList();
    }
    public CrmTaskResponse create(CrmTaskRequest req) {
        Tenant t = currentTenant();

        CrmTask e = CrmTask.builder()
                .tenant(t)
                .subject(req.getSubject())
                .comments(req.getComments())
                .dueDate(req.getDueDate())
                .callTime(req.getCallTime())
                .status(req.getStatus())
                .build();

        if (req.getAssignedToEmployeeId() != null) {
            Employee assignee = employeeRepository.findById(req.getAssignedToEmployeeId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Assignee not found: " + req.getAssignedToEmployeeId()));
            e.setAssignedTo(assignee);
        }

        if (req.getEmployeeIds() != null && !req.getEmployeeIds().isEmpty()) {
            Set<Employee> emps = new LinkedHashSet<>(employeeRepository.findAllById(req.getEmployeeIds()));
            e.setEmployees(emps);
        }

        if (req.getContactIds() != null && !req.getContactIds().isEmpty()) {
            Set<Contact> cons = new LinkedHashSet<>(contactRepository.findAllById(req.getContactIds()));
            e.setContacts(cons);
        }

        if (req.getLeadId() != null) {
            CrmLead lead = leadRepository.findById(req.getLeadId())
                    .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + req.getLeadId()));
            e.setLead(lead);
        }

        return toResponse(taskRepo.save(e));
    }

    public CrmTaskResponse update(Long id, CrmTaskRequest req) {
        Tenant t = currentTenant();
        CrmTask e = taskRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));

        if (req.getSubject() != null) e.setSubject(req.getSubject());
        e.setComments(req.getComments());
        e.setDueDate(req.getDueDate());
        e.setCallTime(req.getCallTime());
        e.setStatus(req.getStatus());

        if (req.getAssignedToEmployeeId() != null) {
            Employee assignee = employeeRepository.findById(req.getAssignedToEmployeeId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Assignee not found: " + req.getAssignedToEmployeeId()));
            e.setAssignedTo(assignee);
        } else {
            e.setAssignedTo(null);
        }

        if (req.getEmployeeIds() != null) {
            Set<Employee> emps = new LinkedHashSet<>(employeeRepository.findAllById(req.getEmployeeIds()));
            e.setEmployees(emps);
        }

        if (req.getContactIds() != null) {
            Set<Contact> cons = new LinkedHashSet<>(contactRepository.findAllById(req.getContactIds()));
            e.setContacts(cons);
        }

        if (req.getLeadId() != null) {
            CrmLead lead = leadRepository.findById(req.getLeadId())
                    .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + req.getLeadId()));
            e.setLead(lead);
        } else {
            e.setLead(null);
        }
        return toResponse(taskRepo.save(e));
    }

    public void delete(Long id) {
        Tenant t = currentTenant();
        CrmTask e = taskRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
        taskRepo.delete(e);
    }

    /* ----------------- mapper ----------------- */

    private CrmTaskResponse toResponse(CrmTask e) {
        DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        return CrmTaskResponse.builder()
                .id(e.getId())
                .tenantId(e.getTenant() != null ? e.getTenant().getId() : null)
                .subject(e.getSubject())
                .comments(e.getComments())
                .dueDate(e.getDueDate())
                .callTime(e.getCallTime())
                .assignedToId(e.getAssignedTo() != null ? e.getAssignedTo().getId() : null)
                .assignedToName(e.getAssignedTo() != null
                        ? fullName(e.getAssignedTo().getFirstName(), e.getAssignedTo().getLastName())
                        : null)
                .employees(e.getEmployees().stream()
                        .map(emp -> new SimpleIdNameDto(
                                emp.getId(),
                                fullName(emp.getFirstName(), emp.getLastName())))
                        .collect(Collectors.toList()))
                .contacts(e.getContacts().stream()
                        .map(c -> new SimpleIdNameDto(
                                c.getId(),
                                fullName(c.getFirstName(), c.getLastName())))
                        .collect(Collectors.toList()))
                .leadId(e.getLead() != null ? e.getLead().getId() : null)
                .status(e.getStatus())
                .createdAt(e.getCreatedAt() != null ? dtf.format(e.getCreatedAt()) : null)
                .updatedAt(e.getUpdatedAt() != null ? dtf.format(e.getUpdatedAt()) : null)
                .build();
    }

    private String fullName(String first, String last) {
        String f = first == null ? "" : first.trim();
        String l = last == null ? "" : last.trim();
        return (f + " " + l).trim();
    }
}
