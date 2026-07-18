package com.example.multi_tanent.tenant.base.service;

import com.example.multi_tanent.tenant.base.dto.WorkCalendarExceptionRequest;
import com.example.multi_tanent.tenant.base.dto.WorkCalendarExceptionResponse;
import com.example.multi_tanent.tenant.base.entity.HolidayPolicy;
import com.example.multi_tanent.tenant.base.entity.WorkCalendarException;
import com.example.multi_tanent.tenant.base.repository.WorkCalendarExceptionRepository;
import com.example.multi_tanent.tenant.leave.repository.HolidayPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional("tenantTx")
public class WorkCalendarExceptionService {

    private final WorkCalendarExceptionRepository exceptionRepository;
    private final HolidayPolicyRepository holidayPolicyRepository;

    public WorkCalendarExceptionService(WorkCalendarExceptionRepository exceptionRepository,
                                        HolidayPolicyRepository holidayPolicyRepository) {
        this.exceptionRepository = exceptionRepository;
        this.holidayPolicyRepository = holidayPolicyRepository;
    }

    public WorkCalendarExceptionResponse create(WorkCalendarExceptionRequest request) {
        WorkCalendarException exception = new WorkCalendarException();
        mapRequestToEntity(request, exception);
        WorkCalendarException saved = exceptionRepository.save(exception);
        return mapToResponse(saved);
    }

    public WorkCalendarExceptionResponse update(Long id, WorkCalendarExceptionRequest request) {
        WorkCalendarException exception = exceptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exception not found with id: " + id));
        mapRequestToEntity(request, exception);
        WorkCalendarException updated = exceptionRepository.save(exception);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<WorkCalendarExceptionResponse> getByPolicyId(Long policyId) {
        return exceptionRepository.findByHolidayPolicyId(policyId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public void delete(Long id) {
        exceptionRepository.deleteById(id);
    }

    private void mapRequestToEntity(WorkCalendarExceptionRequest request, WorkCalendarException entity) {
        HolidayPolicy policy = holidayPolicyRepository.findById(request.getHolidayPolicyId())
                .orElseThrow(() -> new RuntimeException("Holiday Policy not found"));
        entity.setHolidayPolicy(policy);
        entity.setExceptionDate(request.getExceptionDate());
        entity.setWorkingDay(request.getWorkingDay());
        entity.setReason(request.getReason());
    }

    private WorkCalendarExceptionResponse mapToResponse(WorkCalendarException entity) {
        WorkCalendarExceptionResponse resp = new WorkCalendarExceptionResponse();
        resp.setId(entity.getId());
        resp.setExceptionDate(entity.getExceptionDate());
        resp.setWorkingDay(entity.getWorkingDay());
        resp.setReason(entity.getReason());
        if (entity.getHolidayPolicy() != null) {
            resp.setHolidayPolicyId(entity.getHolidayPolicy().getId());
            resp.setHolidayPolicyName(entity.getHolidayPolicy().getName());
        }
        return resp;
    }
}
