package com.example.multi_tanent.tenant.base.service;

import com.example.multi_tanent.tenant.base.dto.WorkScheduleDayRequest;
import com.example.multi_tanent.tenant.base.dto.WorkScheduleDayResponse;
import com.example.multi_tanent.tenant.base.dto.WorkScheduleRequest;
import com.example.multi_tanent.tenant.base.dto.WorkScheduleResponse;
import com.example.multi_tanent.tenant.base.entity.HolidayPolicy;
import com.example.multi_tanent.tenant.base.entity.WorkSchedule;
import com.example.multi_tanent.tenant.base.entity.WorkScheduleDay;
import com.example.multi_tanent.tenant.base.repository.WorkScheduleDayRepository;
import com.example.multi_tanent.tenant.base.repository.WorkScheduleRepository;
import com.example.multi_tanent.tenant.leave.repository.HolidayPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(transactionManager = "tenantTx")
public class WorkScheduleService {

    private final WorkScheduleRepository workScheduleRepository;
    private final WorkScheduleDayRepository workScheduleDayRepository;
    private final HolidayPolicyRepository holidayPolicyRepository;

    public WorkScheduleService(WorkScheduleRepository workScheduleRepository,
            WorkScheduleDayRepository workScheduleDayRepository,
            HolidayPolicyRepository holidayPolicyRepository) {
        this.workScheduleRepository = workScheduleRepository;
        this.workScheduleDayRepository = workScheduleDayRepository;
        this.holidayPolicyRepository = holidayPolicyRepository;
    }

    public WorkScheduleResponse create(WorkScheduleRequest request) {
        if (workScheduleRepository.existsByName(request.getName())) {
            throw new RuntimeException("Work schedule with name '" + request.getName() + "' already exists.");
        }
        if (workScheduleRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Work schedule with code '" + request.getCode() + "' already exists.");
        }
        
        WorkSchedule schedule = new WorkSchedule();
        mapRequestToEntity(request, schedule);
        WorkSchedule saved = workScheduleRepository.save(schedule);
        return mapEntityToResponse(saved);
    }

    public WorkScheduleResponse update(Long id, WorkScheduleRequest request) {
        WorkSchedule schedule = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work Schedule not found with id: " + id));

        // Check uniqueness if name or code is changed
        if (!schedule.getName().equals(request.getName()) && workScheduleRepository.existsByName(request.getName())) {
            throw new RuntimeException("Work schedule with name '" + request.getName() + "' already exists.");
        }
        if (!schedule.getCode().equals(request.getCode()) && workScheduleRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Work schedule with code '" + request.getCode() + "' already exists.");
        }

        mapRequestToEntity(request, schedule);
        WorkSchedule updated = workScheduleRepository.save(schedule);
        return mapEntityToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<WorkScheduleResponse> getAll() {
        return workScheduleRepository.findAll().stream()
                .map(this::mapEntityToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public WorkScheduleResponse getById(Long id) {
        WorkSchedule schedule = workScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Work Schedule not found with id: " + id));
        return mapEntityToResponse(schedule);
    }

    public void delete(Long id) {
        workScheduleRepository.deleteById(id);
    }

    private void mapRequestToEntity(WorkScheduleRequest request, WorkSchedule entity) {
        entity.setName(request.getName());
        entity.setCode(request.getCode());
        entity.setActive(request.getActive());

        if (request.getHolidayPolicyId() != null) {
            HolidayPolicy holidayPolicy = holidayPolicyRepository.findById(request.getHolidayPolicyId())
                    .orElseThrow(() -> new RuntimeException("Holiday Policy not found"));
            entity.setHolidayPolicy(holidayPolicy);
        } else {
            entity.setHolidayPolicy(null);
        }

        // Handle Days
        entity.getDays().clear();
        BigDecimal totalHours = BigDecimal.ZERO;
        if (request.getDays() != null) {
            for (WorkScheduleDayRequest dayReq : request.getDays()) {
                WorkScheduleDay day = new WorkScheduleDay();
                day.setWorkSchedule(entity);
                day.setDayOfWeek(dayReq.getDayOfWeek());
                day.setIsWorkingDay(dayReq.getIsWorkingDay());
                day.setWorkingHours(
                        Boolean.TRUE.equals(dayReq.getIsWorkingDay()) ? dayReq.getWorkingHours() : BigDecimal.ZERO);
                entity.getDays().add(day);

                if (Boolean.TRUE.equals(day.getIsWorkingDay()) && day.getWorkingHours() != null) {
                    totalHours = totalHours.add(day.getWorkingHours());
                }
            }
        }
        entity.setTotalWeeklyHours(totalHours.intValue());
    }

    private WorkScheduleResponse mapEntityToResponse(WorkSchedule entity) {
        WorkScheduleResponse resp = new WorkScheduleResponse();
        resp.setId(entity.getId());
        resp.setName(entity.getName());
        resp.setCode(entity.getCode());
        resp.setTotalWeeklyHours(entity.getTotalWeeklyHours());
        resp.setActive(entity.getActive());

        if (entity.getHolidayPolicy() != null) {
            WorkScheduleResponse.HolidayPolicySummary summary = new WorkScheduleResponse.HolidayPolicySummary();
            summary.setId(entity.getHolidayPolicy().getId());
            summary.setName(entity.getHolidayPolicy().getName());
            summary.setYear(entity.getHolidayPolicy().getYear());
            resp.setHolidayPolicy(summary);
        }

        if (entity.getDays() != null) {
            resp.setDays(entity.getDays().stream()
                .filter(day -> day != null)
                .map(day -> {
                    WorkScheduleDayResponse dr = new WorkScheduleDayResponse();
                    dr.setId(day.getId());
                    dr.setDayOfWeek(day.getDayOfWeek());
                    dr.setWorkingHours(day.getWorkingHours());
                    dr.setIsWorkingDay(day.getIsWorkingDay());
                    return dr;
                }).collect(Collectors.toList()));
        } else {
            resp.setDays(List.of());
        }

        return resp;
    }
}
