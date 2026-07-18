package com.example.multi_tanent.crm.services;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmEventRequest;
import com.example.multi_tanent.crm.dto.CrmEventResponse;
import com.example.multi_tanent.crm.entity.Contact;
import com.example.multi_tanent.crm.entity.CrmLead;
import com.example.multi_tanent.crm.entity.CrmEvent;
import com.example.multi_tanent.crm.repository.ContactRepository;
import com.example.multi_tanent.crm.repository.CrmLeadRepository;
import com.example.multi_tanent.crm.repository.CrmEventRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmEventService {

    private final CrmEventRepository eventRepo;
    private final EmployeeRepository employeeRepo;
    private final ContactRepository  contactRepo;
    private final CrmLeadRepository leadRepository;
    private final TenantRepository tenantRepo;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found for key: " + key));
    }

    @Transactional(readOnly = true)
    public List<CrmEventResponse> getAll() {
        Tenant t = currentTenant();
        return eventRepo.findByTenantIdOrderByDateDescFromTimeDesc(t.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public CrmEventResponse getById(Long id) {
        Tenant t = currentTenant();
        CrmEvent e = eventRepo.findById(id)
                .filter(ev -> ev.getTenant().getId().equals(t.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Event not found: " + id));
        return toResponse(e);
    }

    @Transactional(readOnly = true)
    public List<CrmEventResponse> getEventsByLeadId(Long leadId) {
        Tenant t = currentTenant();
        // Ensure the lead exists for the current tenant before fetching events
        leadRepository.findByIdAndTenantId(leadId, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + leadId));

        return eventRepo.findByTenantIdAndLeadIdOrderByDateDescFromTimeDesc(t.getId(), leadId)
                .stream().map(this::toResponse).toList();
    }


    public CrmEventResponse create(CrmEventRequest req) {
        Tenant t = currentTenant();
        CrmEvent e = new CrmEvent();
        e.setTenant(t);
        apply(e, req);
        return toResponse(eventRepo.save(e));
    }

    public CrmEventResponse update(Long id, CrmEventRequest req) {
        Tenant t = currentTenant();
        CrmEvent e = eventRepo.findById(id)
                .filter(ev -> ev.getTenant().getId().equals(t.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Event not found: " + id));
        apply(e, req);
        return toResponse(eventRepo.save(e));
    }

    public void delete(Long id) {
        Tenant t = currentTenant();
        CrmEvent e = eventRepo.findById(id)
                .filter(ev -> ev.getTenant().getId().equals(t.getId()))
                .orElseThrow(() -> new EntityNotFoundException("Event not found: " + id));
        eventRepo.delete(e);
    }

    @Transactional(readOnly = true)
    public boolean isEmployeeBusy(Long employeeId, CrmEventRequest req) {
        Tenant t = currentTenant();
        if (req.getToTime() == null) return false;
        return !eventRepo.findByTenantIdAndDateAndEmployees_IdAndFromTimeLessThanAndToTimeGreaterThan(
                t.getId(), req.getDate(), employeeId, req.getToTime(), req.getFromTime()
        ).isEmpty();
    }

    /* ===== helpers ===== */

    private void apply(CrmEvent e, CrmEventRequest req) {
        e.setSubject(req.getSubject());
        e.setDescription(req.getDescription());
        e.setSameStartEnd(Boolean.TRUE.equals(req.getSameStartEnd()));
        e.setDate(req.getDate());
        e.setFromTime(req.getFromTime());
        e.setToTime(req.getToTime());

        // primary contact
        if (req.getPrimaryContactId() != null) {
            Contact pc = contactRepo.findById(req.getPrimaryContactId())
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found: " + req.getPrimaryContactId()));
            e.setPrimaryContact(pc);
        } else {
            e.setPrimaryContact(null);
        }

        // employees
        if (req.getEmployeeIds() != null && !req.getEmployeeIds().isEmpty()) {
            e.setEmployees(new HashSet<>(employeeRepo.findAllById(req.getEmployeeIds())));
        }

        // contacts
        if (req.getContactIds() != null && !req.getContactIds().isEmpty()) {
            e.setContacts(new HashSet<>(contactRepo.findAllById(req.getContactIds())));
        }

        // lead
        if (req.getLeadId() != null) {
            CrmLead lead = leadRepository.findById(req.getLeadId())
                    .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + req.getLeadId()));
            e.setLead(lead);
        } else {
            e.setLead(null);
        }
        e.setStatus(req.getStatus());
        e.setPriority(req.getPriority());
        e.setMeetingType(req.getMeetingType());
        e.setMeetingWith(req.getMeetingWith());
    }

    private CrmEventResponse toResponse(CrmEvent e) {
        return CrmEventResponse.builder()
                .id(e.getId())
                .tenantId(e.getTenant().getId())
                .subject(e.getSubject())
                .description(e.getDescription())
                .sameStartEnd(e.isSameStartEnd())
                .date(e.getDate())
                .fromTime(e.getFromTime())
                .toTime(e.getToTime())
                .primaryContactId(e.getPrimaryContact() != null ? e.getPrimaryContact().getId() : null)
                .primaryContactName(e.getPrimaryContact() != null ? (e.getPrimaryContact().getFirstName() + " " + e.getPrimaryContact().getLastName()) : null) // adapt getter
                .employeeIds(e.getEmployees().stream().map(Employee::getId).toList())
                .employeeNames(e.getEmployees().stream().map(emp -> emp.getFirstName() + " " + emp.getLastName()).toList()) // adapt getter
                .contactIds(e.getContacts().stream().map(Contact::getId).toList())
                .contactNames(e.getContacts().stream().map(c -> c.getFirstName() + " " + c.getLastName()).toList()) // adapt getter
                .leadId(e.getLead() != null ? e.getLead().getId() : null)
                .status(e.getStatus())
                .priority(e.getPriority())
                .meetingType(e.getMeetingType())
                .meetingWith(e.getMeetingWith())
                .build();
    }
}
