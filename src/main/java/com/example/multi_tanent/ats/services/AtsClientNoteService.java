package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsClientNoteRequest;
import com.example.multi_tanent.ats.dto.AtsClientNoteResponse;
import com.example.multi_tanent.ats.entity.AtsAction;
import com.example.multi_tanent.ats.entity.AtsClient;
import com.example.multi_tanent.ats.entity.AtsClientNote;
import com.example.multi_tanent.ats.repository.AtsActionRepository;
import com.example.multi_tanent.ats.repository.AtsClientNoteRepository;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsClientNoteService {

    private final AtsClientNoteRepository noteRepository;
    private final AtsClientRepository clientRepository;
    private final TenantRepository tenantRepository;
    private final AtsActionRepository actionRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsClientNoteResponse create(AtsClientNoteRequest request) {
        Tenant tenant = currentTenant();

        AtsClient client = clientRepository.findByIdAndTenantId(request.getClientId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + request.getClientId()));

        AtsClientNote note = AtsClientNote.builder()
                .tenant(tenant)
                .client(client)
                .notesPriority(request.getNotesPriority())
                .noteBody(request.getNoteBody())
                .remindMe(request.getRemindMe() != null ? request.getRemindMe() : false)
                .build();

        resolveFKs(note, request, tenant.getId());

        AtsClientNote saved = noteRepository.save(note);
        return toResponse(saved);
    }

    public AtsClientNoteResponse update(Long id, AtsClientNoteRequest request) {
        Tenant tenant = currentTenant();

        AtsClientNote note = noteRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client note not found with id " + id));

        AtsClient client = clientRepository.findByIdAndTenantId(request.getClientId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + request.getClientId()));

        note.setClient(client);
        note.setNotesPriority(request.getNotesPriority());
        note.setNoteBody(request.getNoteBody());
        if (request.getRemindMe() != null) note.setRemindMe(request.getRemindMe());

        resolveFKs(note, request, tenant.getId());

        AtsClientNote saved = noteRepository.save(note);
        return toResponse(saved);
    }

    private void resolveFKs(AtsClientNote note, AtsClientNoteRequest request, Long tenantId) {
        if (request.getActionId() != null) {
            AtsAction action = actionRepository.findById(request.getActionId())
                    .orElseThrow(() -> new EntityNotFoundException("Action not found with id " + request.getActionId()));
            note.setAction(action);
        } else {
            note.setAction(null);
        }

        if (request.getCreatedById() != null) {
            Employee creator = employeeRepository.findByIdAndUser_Tenant_Id(request.getCreatedById(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Employee (Creator) not found with id " + request.getCreatedById()));
            note.setCreatedBy(creator);
        } else {
            note.setCreatedBy(null);
        }

        if (request.getNotifyPeopleIds() != null) {
            List<Employee> list = new ArrayList<>();
            for (Long empId : request.getNotifyPeopleIds()) {
                list.add(employeeRepository.findByIdAndUser_Tenant_Id(empId, tenantId)
                        .orElseThrow(() -> new EntityNotFoundException("Employee (Notify Recipient) not found with id " + empId)));
            }
            note.setNotifyPeople(list);
        } else {
            note.setNotifyPeople(new ArrayList<>());
        }
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsClientNoteResponse> getByClientId(Long clientId) {
        Tenant tenant = currentTenant();
        // Verify client
        clientRepository.findByIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + clientId));

        return noteRepository.findByClientIdAndTenantId(clientId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientNoteResponse getById(Long id) {
        Tenant tenant = currentTenant();
        AtsClientNote note = noteRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client note not found with id " + id));
        return toResponse(note);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsClientNote note = noteRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client note not found with id " + id));
        noteRepository.delete(note);
    }

    public AtsClientNoteResponse toResponse(AtsClientNote note) {
        AtsClientNoteResponse.AtsClientNoteResponseBuilder builder = AtsClientNoteResponse.builder()
                .id(note.getId())
                .clientId(note.getClient().getId())
                .clientName(note.getClient().getClientName())
                .actionId(note.getAction() != null ? note.getAction().getId() : null)
                .actionName(note.getAction() != null ? note.getAction().getName() : null)
                .notesPriority(note.getNotesPriority())
                .noteBody(note.getNoteBody())
                .remindMe(note.getRemindMe())
                .createdById(note.getCreatedBy() != null ? note.getCreatedBy().getId() : null)
                .createdByName(note.getCreatedBy() != null ? (note.getCreatedBy().getFirstName() + " " + note.getCreatedBy().getLastName()) : null)
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt());

        if (note.getNotifyPeople() != null) {
            builder.notifyPeople(note.getNotifyPeople().stream()
                    .map(e -> AtsClientNoteResponse.NotifyUserRef.builder()
                            .id(e.getId())
                            .name(e.getFirstName() + " " + e.getLastName())
                            .build())
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }
}
