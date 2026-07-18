package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.*;
import com.example.multi_tanent.crm.entity.Contact;
import com.example.multi_tanent.crm.entity.CrmTodoItem;
import com.example.multi_tanent.crm.entity.CrmTodoLabel;
import com.example.multi_tanent.crm.repository.ContactRepository;
import com.example.multi_tanent.crm.repository.CrmTodoLabelRepository;
import com.example.multi_tanent.crm.repository.CrmTodoRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmTodoService {

    private final CrmTodoRepository todoRepo;
    private final CrmTodoLabelRepository labelRepo;
    private final TenantRepository tenantRepo;
    private final EmployeeRepository employeeRepo;
    private final ContactRepository contactRepo;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public CrmTodoResponse create(CrmTodoRequest req) {
        Tenant tenant = currentTenant();
        CrmTodoItem todo = new CrmTodoItem();
        todo.setTenant(tenant);
        mapRequestToEntity(req, todo);
        return toResponse(todoRepo.save(todo));
    }

    public CrmTodoResponse update(Long id, CrmTodoRequest req) {
        Tenant tenant = currentTenant();
        CrmTodoItem todo = todoRepo.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));
        mapRequestToEntity(req, todo);
        return toResponse(todoRepo.save(todo));
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        if (!todoRepo.existsById(id)) {
            throw new EntityNotFoundException("Todo not found: " + id);
        }
        todoRepo.deleteById(id);
    }

    @Transactional(readOnly = true)
    public CrmTodoResponse get(Long id) {
        Tenant tenant = currentTenant();
        return todoRepo.findByIdAndTenantId(id, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Todo not found: " + id));
    }

    @Transactional(readOnly = true)
    public Page<CrmTodoResponse> search(CrmTodoFilterRequest filter, Pageable pageable) {
        Tenant tenant = currentTenant();
        Specification<CrmTodoItem> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("tenant").get("id"), tenant.getId()));
            // Filter logic removed as requested
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return todoRepo.findAll(spec, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<CrmTodoSubjectCount> subjectCounts() {
        return todoRepo.countBySubjectForTenant(currentTenant().getId());
    }

    /* ---------------------- Labels ---------------------- */

    @Transactional(readOnly = true)
    public List<CrmTodoLabelResponse> getLabels() {
        return labelRepo.findByTenantIdOrderByNameAsc(currentTenant().getId())
                .stream().map(this::toLabelResponse).toList();
    }

    public CrmTodoLabelResponse createLabel(CrmTodoLabelRequest req) {
        CrmTodoLabel label = new CrmTodoLabel();
        label.setTenant(currentTenant());
        mapLabelRequestToEntity(req, label);
        return toLabelResponse(labelRepo.save(label));
    }

    public CrmTodoLabelResponse updateLabel(Long id, CrmTodoLabelRequest req) {
        CrmTodoLabel label = labelRepo.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Label not found: " + id));
        mapLabelRequestToEntity(req, label);
        return toLabelResponse(labelRepo.save(label));
    }

    public void deleteLabel(Long id) {
        if (!labelRepo.existsById(id)) {
            throw new EntityNotFoundException("Label not found: " + id);
        }
        labelRepo.deleteById(id);
    }

    /* ---------------------- Mappers ---------------------- */

    private void mapRequestToEntity(CrmTodoRequest req, CrmTodoItem entity) {
        entity.setSubject(req.getSubject());
        entity.setDescription(req.getDescription());
        entity.setDueDate(req.getDueDate());
        entity.setFromTime(req.getFromTime());
        entity.setToTime(req.getToTime());
        if (req.getStatus() != null) entity.setStatus(req.getStatus());
        if (req.getPriority() != null) entity.setPriority(req.getPriority());
        entity.setCustomerContactName(req.getCustomerContactName());

        if (req.getAssignedToEmployeeId() != null) {
            Employee assignee = employeeRepo.findById(req.getAssignedToEmployeeId()).orElseThrow(() -> new EntityNotFoundException("Assignee not found"));
            entity.setAssignedTo(assignee);
        } else {
            entity.setAssignedTo(null);
        }

        if (!CollectionUtils.isEmpty(req.getEmployeeIds())) {
            entity.setEmployees(new HashSet<>(employeeRepo.findAllById(req.getEmployeeIds())));
        } else {
            entity.getEmployees().clear();
        }

        if (!CollectionUtils.isEmpty(req.getContactIds())) {
            entity.setContacts(new HashSet<>(contactRepo.findAllById(req.getContactIds())));
        } else {
            entity.getContacts().clear();
        }

        if (!CollectionUtils.isEmpty(req.getLabelIds())) {
            entity.setLabels(new HashSet<>(labelRepo.findAllById(req.getLabelIds())));
        } else {
            entity.getLabels().clear();
        }
    }

    private CrmTodoResponse toResponse(CrmTodoItem e) {
        DateTimeFormatter dtf = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
        return CrmTodoResponse.builder()
                .id(e.getId())
                .subject(e.getSubject())
                .description(e.getDescription())
                .dueDate(e.getDueDate())
                .fromTime(e.getFromTime())
                .toTime(e.getToTime())
                .status(e.getStatus())
                .priority(e.getPriority())
                .customerContactName(e.getCustomerContactName())
                .assignedToId(e.getAssignedTo() != null ? e.getAssignedTo().getId() : null)
                .assignedToName(e.getAssignedTo() != null ? e.getAssignedTo().getFirstName() + " " + e.getAssignedTo().getLastName() : null)
                .employees(e.getEmployees().stream().map(emp -> new SimpleIdNameDto(emp.getId(), emp.getFirstName() + " " + emp.getLastName())).collect(Collectors.toList()))
                .contacts(e.getContacts().stream().map(c -> new SimpleIdNameDto(c.getId(), c.getFirstName() + " " + c.getLastName())).collect(Collectors.toList()))
                .labels(e.getLabels().stream().map(l -> new SimpleIdNameDto(l.getId(), l.getName())).collect(Collectors.toList()))
                .createdAt(e.getCreatedAt() != null ? dtf.format(e.getCreatedAt()) : null)
                .updatedAt(e.getUpdatedAt() != null ? dtf.format(e.getUpdatedAt()) : null)
                .build();
    }

    private void mapLabelRequestToEntity(CrmTodoLabelRequest req, CrmTodoLabel entity) {
        entity.setName(req.getName());
        entity.setColorHex(req.getColorHex());
        entity.setStarred(req.isStarred());
    }

    private CrmTodoLabelResponse toLabelResponse(CrmTodoLabel entity) {
        return CrmTodoLabelResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .colorHex(entity.getColorHex())
                .starred(entity.isStarred())
                .build();
    }
}
