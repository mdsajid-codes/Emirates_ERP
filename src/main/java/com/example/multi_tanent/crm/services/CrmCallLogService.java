package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmCallLogDto;
import com.example.multi_tanent.crm.dto.CrmCallLogRequestDto;
import com.example.multi_tanent.crm.entity.Contact;
import com.example.multi_tanent.crm.entity.CrmCallLog;
import com.example.multi_tanent.crm.entity.CrmLead;
import com.example.multi_tanent.crm.repository.ContactRepository;
import com.example.multi_tanent.crm.repository.CrmCallLogRepository;
import com.example.multi_tanent.crm.repository.CrmLeadRepository;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant; // Corrected import
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository; // Corrected import
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmCallLogService {

    private final CrmCallLogRepository callLogRepository;
    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;
    private final CrmLeadRepository leadRepository;
    private final ContactRepository contactRepository;
    private final CrmAccessService crmAccessService;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public Page<CrmCallLogDto> getAll(Pageable pageable) {
        if (crmAccessService.isOwnerOnly("CALL_LOG")) {
            Long empId = crmAccessService.getCurrentEmployeeId();
            return callLogRepository.findByTenantIdAndEmployeeId(getCurrentTenant().getId(), empId, pageable)
                    .map(CrmCallLogDto::fromEntity);
        }
        return callLogRepository.findByTenantId(getCurrentTenant().getId(), pageable)
                .map(CrmCallLogDto::fromEntity);
    }

    public CrmCallLogDto getById(Long id) {
        return callLogRepository.findByIdAndTenantId(id, getCurrentTenant().getId())
                .map(CrmCallLogDto::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Call Log not found with id: " + id));
    }

    public List<CrmCallLogDto> getByLeadId(Long leadId) {
        return callLogRepository.findByLeadIdAndTenantId(leadId, getCurrentTenant().getId())
                .stream()
                .map(CrmCallLogDto::fromEntity)
                .collect(Collectors.toList());
    }

    public CrmCallLogDto create(CrmCallLogRequestDto request) {
        CrmCallLog callLog = new CrmCallLog();
        callLog.setTenant(getCurrentTenant());
        mapRequestToEntity(request, callLog);
        return CrmCallLogDto.fromEntity(callLogRepository.save(callLog));
    }

    public CrmCallLogDto update(Long id, CrmCallLogRequestDto request) {
        CrmCallLog callLog = callLogRepository.findByIdAndTenantId(id, getCurrentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Call Log not found with id: " + id));
        mapRequestToEntity(request, callLog);
        return CrmCallLogDto.fromEntity(callLogRepository.save(callLog));
    }

    public void delete(Long id) {
        if (!callLogRepository.existsById(id)) {
            throw new EntityNotFoundException("Call Log not found with id: " + id);
        }
        callLogRepository.deleteById(id);
    }

    private void mapRequestToEntity(CrmCallLogRequestDto request, CrmCallLog callLog) {
        callLog.setComments(request.getComments());
        callLog.setCallDate(request.getCallDate());
        callLog.setCallTime(request.getCallTime());
        callLog.setRemindMeBefore(request.isRemindMeBefore());
        callLog.setReminderTime(request.getReminderTime());

        if (request.getEmployeeId() != null) {
            Employee employee = employeeRepository.findById(request.getEmployeeId())
                    .orElseThrow(() -> new EntityNotFoundException("Employee not found with id: " + request.getEmployeeId()));
            callLog.setEmployee(employee);
        }

        if (request.getLeadId() != null) {
            CrmLead lead = leadRepository.findById(request.getLeadId())
                    .orElseThrow(() -> new EntityNotFoundException("Lead not found with id: " + request.getLeadId()));
            callLog.setLead(lead);
        }

        if (request.getContactId() != null) {
            Contact contact = contactRepository.findById(request.getContactId())
                    .orElseThrow(() -> new EntityNotFoundException("Contact not found with id: " + request.getContactId()));
            callLog.setContact(contact);
        }
    }
}