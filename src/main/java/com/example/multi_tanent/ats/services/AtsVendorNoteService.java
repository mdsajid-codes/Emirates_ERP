package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsVendorNoteRequest;
import com.example.multi_tanent.ats.dto.AtsVendorNoteResponse;
import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.entity.AtsVendorNote;
import com.example.multi_tanent.ats.repository.AtsActionRepository;
import com.example.multi_tanent.ats.repository.AtsVendorNoteRepository;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsVendorNoteService {

    private final AtsVendorNoteRepository noteRepository;
    private final AtsVendorRepository vendorRepository;
    private final TenantRepository tenantRepository;
    private final AtsActionRepository actionRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsVendorNoteResponse create(Long vendorId, AtsVendorNoteRequest request) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        AtsVendorNote note = AtsVendorNote.builder()
                .tenant(tenant)
                .vendor(vendor)
                .noteTitle(request.getNoteTitle())
                .noteBody(request.getNoteBody())
                .notesPriority(request.getNotesPriority())
                .noteHeader(request.getNoteHeader())
                .remindMe(request.getRemindMe() != null ? request.getRemindMe() : false)
                .isPinned(request.getIsPinned() != null ? request.getIsPinned() : false)
                .build();

        resolveFKs(note, request, tenant.getId());

        AtsVendorNote saved = noteRepository.save(note);
        return toResponse(saved);
    }

    public AtsVendorNoteResponse update(Long vendorId, Long noteId, AtsVendorNoteRequest request) {
        Tenant tenant = currentTenant();
        vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        AtsVendorNote note = noteRepository.findByIdAndVendorIdAndTenantId(noteId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Note not found with id " + noteId));

        note.setNoteTitle(request.getNoteTitle());
        note.setNoteBody(request.getNoteBody());
        note.setNotesPriority(request.getNotesPriority());
        note.setNoteHeader(request.getNoteHeader());
        if (request.getRemindMe() != null) note.setRemindMe(request.getRemindMe());
        if (request.getIsPinned() != null) note.setIsPinned(request.getIsPinned());

        resolveFKs(note, request, tenant.getId());

        AtsVendorNote saved = noteRepository.save(note);
        return toResponse(saved);
    }

    private void resolveFKs(AtsVendorNote note, AtsVendorNoteRequest request, Long tenantId) {
        if (request.getActionId() != null) {
            note.setAction(actionRepository.findByIdAndTenantId(request.getActionId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Action not found")));
        } else {
            note.setAction(null);
        }

        if (request.getNotifyPeopleIds() != null) {
            List<Employee> emps = new ArrayList<>();
            for (Long empId : request.getNotifyPeopleIds()) {
                emps.add(employeeRepository.findByIdAndUser_Tenant_Id(empId, tenantId)
                        .orElseThrow(() -> new EntityNotFoundException("Employee not found with id " + empId)));
            }
            note.setNotifyPeople(emps);
        } else {
            note.setNotifyPeople(new ArrayList<>());
        }
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsVendorNoteResponse> getAll(Long vendorId) {
        Tenant tenant = currentTenant();
        return noteRepository.findByVendorIdAndTenantId(vendorId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorNoteResponse getById(Long vendorId, Long noteId) {
        Tenant tenant = currentTenant();
        AtsVendorNote note = noteRepository.findByIdAndVendorIdAndTenantId(noteId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));
        return toResponse(note);
    }

    public void delete(Long vendorId, Long noteId) {
        Tenant tenant = currentTenant();
        AtsVendorNote note = noteRepository.findByIdAndVendorIdAndTenantId(noteId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));
        noteRepository.delete(note);
    }

    public AtsVendorNoteResponse togglePin(Long vendorId, Long noteId) {
        Tenant tenant = currentTenant();
        AtsVendorNote note = noteRepository.findByIdAndVendorIdAndTenantId(noteId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Note not found"));
        note.setIsPinned(!note.getIsPinned());
        AtsVendorNote saved = noteRepository.save(note);
        return toResponse(saved);
    }

    private AtsVendorNoteResponse toResponse(AtsVendorNote n) {
        AtsVendorNoteResponse.AtsVendorNoteResponseBuilder builder = AtsVendorNoteResponse.builder()
                .id(n.getId())
                .noteTitle(n.getNoteTitle())
                .noteBody(n.getNoteBody())
                .actionId(n.getAction() != null ? n.getAction().getId() : null)
                .actionName(n.getAction() != null ? n.getAction().getName() : null)
                .notesPriority(n.getNotesPriority())
                .noteHeader(n.getNoteHeader())
                .remindMe(n.getRemindMe())
                .isPinned(n.getIsPinned())
                .createdById(n.getCreatedBy() != null ? n.getCreatedBy().getId() : null)
                .createdByName(n.getCreatedBy() != null ? (n.getCreatedBy().getFirstName() + " " + n.getCreatedBy().getLastName()) : null)
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt());

        if (n.getNotifyPeople() != null) {
            builder.notifyPeople(n.getNotifyPeople().stream()
                    .map(emp -> AtsVendorNoteResponse.EmployeeRef.builder()
                            .id(emp.getId())
                            .name(emp.getFirstName() + " " + emp.getLastName())
                            .build())
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }
}
