package com.example.multi_tanent.tenant.leave.service;

import com.example.multi_tanent.tenant.base.entity.TimeType;
import com.example.multi_tanent.tenant.base.repository.TimeTypeRepository;
import com.example.multi_tanent.tenant.leave.dto.SickLeaveTypeRequest;
import com.example.multi_tanent.tenant.leave.dto.SickLeaveIntervalRequest;
import com.example.multi_tanent.tenant.leave.entity.SickLeaveType;
import com.example.multi_tanent.tenant.leave.entity.SickLeaveInterval;
import com.example.multi_tanent.tenant.leave.repository.SickLeaveTypeRepository;
import com.example.multi_tanent.tenant.leave.repository.SickLeaveIntervalRepository;
import com.example.multi_tanent.tenant.payroll.entity.SalaryComponent;
import com.example.multi_tanent.tenant.payroll.repository.SalaryComponentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(transactionManager = "tenantTx")
public class SickLeaveTypeService {

    private final SickLeaveTypeRepository sickLeaveTypeRepository;
    private final SickLeaveIntervalRepository sickLeaveIntervalRepository;
    private final TimeTypeRepository timeTypeRepository;
    private final SalaryComponentRepository salaryComponentRepository;

    public SickLeaveTypeService(SickLeaveTypeRepository sickLeaveTypeRepository,
                                SickLeaveIntervalRepository sickLeaveIntervalRepository,
                                TimeTypeRepository timeTypeRepository,
                                SalaryComponentRepository salaryComponentRepository) {
        this.sickLeaveTypeRepository = sickLeaveTypeRepository;
        this.sickLeaveIntervalRepository = sickLeaveIntervalRepository;
        this.timeTypeRepository = timeTypeRepository;
        this.salaryComponentRepository = salaryComponentRepository;
    }

    public SickLeaveType create(SickLeaveTypeRequest request) {
        validateIntervals(request.getIntervals());
        SickLeaveType sickLeaveType = new SickLeaveType();
        mapRequestToEntity(request, sickLeaveType);
        return sickLeaveTypeRepository.save(sickLeaveType);
    }

    public SickLeaveType update(Long id, SickLeaveTypeRequest request) {
        validateIntervals(request.getIntervals());
        SickLeaveType sickLeaveType = sickLeaveTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sick Leave Type not found with id: " + id));
        mapRequestToEntity(request, sickLeaveType);
        return sickLeaveTypeRepository.save(sickLeaveType);
    }

    @Transactional(readOnly = true)
    public List<SickLeaveType> getAll() {
        return sickLeaveTypeRepository.findAll();
    }

    @Transactional(readOnly = true)
    public SickLeaveType getById(Long id) {
        return sickLeaveTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sick Leave Type not found with id: " + id));
    }

    public void delete(Long id) {
        sickLeaveTypeRepository.deleteById(id);
    }

    private void mapRequestToEntity(SickLeaveTypeRequest request, SickLeaveType entity) {
        entity.setName(request.getName());
        entity.setDescription(request.getDescription());
        entity.setCalculationMethod(request.getCalculationMethod());
        entity.setDailyEarningBase(request.getDailyEarningBase());
        entity.setAveragingPeriodMonths(request.getAveragingPeriodMonths());
        entity.setActive(request.getActive());

        if (request.getWorkTimeTypeId() != null) {
            TimeType timeType = timeTypeRepository.findById(request.getWorkTimeTypeId())
                    .orElseThrow(() -> new RuntimeException("Time Type not found"));
            entity.setWorkTimeType(timeType);
        }

        if (request.getEarningsTypeId() != null) {
            SalaryComponent salaryComponent = salaryComponentRepository.findById(request.getEarningsTypeId())
                    .orElseThrow(() -> new RuntimeException("Salary Component not found"));
            entity.setEarningsType(salaryComponent);
        }

        // Handle Intervals
        entity.getIntervals().clear();
        if (request.getIntervals() != null) {
            for (SickLeaveIntervalRequest intervalReq : request.getIntervals()) {
                SickLeaveInterval interval = new SickLeaveInterval();
                interval.setSickLeaveType(entity);
                interval.setFromDay(intervalReq.getFromDay());
                interval.setToDay(intervalReq.getToDay());
                interval.setPaymentPercent(intervalReq.getPaymentPercent());
                entity.getIntervals().add(interval);
            }
        }
    }

    private void validateIntervals(List<SickLeaveIntervalRequest> intervals) {
        if (intervals == null || intervals.isEmpty()) {
            throw new IllegalArgumentException("At least one sick leave interval is required.");
        }

        List<SickLeaveIntervalRequest> sortedIntervals = intervals.stream()
                .sorted(Comparator.comparing(SickLeaveIntervalRequest::getFromDay))
                .collect(Collectors.toList());

        if (sortedIntervals.get(0).getFromDay() != 1) {
            throw new IllegalArgumentException("The first interval must start from day 1.");
        }

        for (int i = 0; i < sortedIntervals.size(); i++) {
            SickLeaveIntervalRequest current = sortedIntervals.get(i);
            if (current.getToDay() < current.getFromDay()) {
                throw new IllegalArgumentException("Invalid interval: To Day must be greater than or equal to From Day.");
            }

            if (i > 0) {
                SickLeaveIntervalRequest previous = sortedIntervals.get(i - 1);
                if (current.getFromDay() != previous.getToDay() + 1) {
                    throw new IllegalArgumentException("Gaps or overlaps found in intervals. Interval starting at "
                            + current.getFromDay() + " must follow day " + previous.getToDay());
                }
            }
        }

        // Requirement says last day should be 365
        SickLeaveIntervalRequest last = sortedIntervals.get(sortedIntervals.size() - 1);
        if (last.getToDay() != 365) {
             throw new IllegalArgumentException("The last interval must end at day 365.");
        }
    }
}
