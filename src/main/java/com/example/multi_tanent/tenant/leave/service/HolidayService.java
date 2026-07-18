package com.example.multi_tanent.tenant.leave.service;

import com.example.multi_tanent.tenant.base.entity.Holiday;
import com.example.multi_tanent.tenant.base.entity.HolidayPolicy;
import com.example.multi_tanent.tenant.leave.dto.HolidayPolicyRequest;
import com.example.multi_tanent.tenant.leave.dto.HolidayRequest;
import com.example.multi_tanent.tenant.leave.repository.HolidayPolicyRepository;
import com.example.multi_tanent.tenant.leave.repository.HolidayRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(transactionManager = "tenantTx")
public class HolidayService {

    private final HolidayPolicyRepository holidayPolicyRepository;
    private final HolidayRepository holidayRepository;

    public HolidayService(HolidayPolicyRepository holidayPolicyRepository, HolidayRepository holidayRepository) {
        this.holidayPolicyRepository = holidayPolicyRepository;
        this.holidayRepository = holidayRepository;
    }

    public HolidayPolicy createHolidayPolicy(HolidayPolicyRequest request) {
        HolidayPolicy policy = new HolidayPolicy();
        policy.setName(request.getName());
        policy.setYear(request.getYear());

        if (request.getHolidays() != null) {
            List<Holiday> holidays = request.getHolidays().stream()
                    .map(hr -> convertToHoliday(hr, policy))
                    .collect(Collectors.toList());
            policy.setHolidays(holidays);
        }

        return holidayPolicyRepository.save(policy);
    }

    @Transactional(readOnly = true)
    public List<HolidayPolicy> getAllHolidayPolicies() {
        return holidayPolicyRepository.findAll();
    }

    public HolidayPolicy updateHolidayPolicy(Long policyId, HolidayPolicyRequest request) {
        HolidayPolicy policy = holidayPolicyRepository.findById(policyId)
                .orElseThrow(() -> new EntityNotFoundException("HolidayPolicy not found with id: " + policyId));

        policy.setName(request.getName());
        policy.setYear(request.getYear());

        // This simple update does not handle holiday list modifications.
        // Holidays should be managed via their own endpoints.

        return holidayPolicyRepository.save(policy);
    }

    public void deleteHolidayPolicy(Long policyId) {
        if (!holidayPolicyRepository.existsById(policyId)) {
            throw new EntityNotFoundException("HolidayPolicy not found with id: " + policyId);
        }
        holidayPolicyRepository.deleteById(policyId);
    }

    public Holiday updateHoliday(Long holidayId, HolidayRequest request) {
        Holiday holiday = holidayRepository.findById(holidayId)
                .orElseThrow(() -> new EntityNotFoundException("Holiday not found with id: " + holidayId));

        holiday.setName(request.getName());
        holiday.setDate(request.getDate());
        if (request.getIsOptional() != null) {
            holiday.setIsOptional(request.getIsOptional());
        }
        if (request.getIsPaid() != null) {
            holiday.setIsPaid(request.getIsPaid());
        }

        return holidayRepository.save(holiday);
    }

    public void deleteHoliday(Long holidayId) {
        if (!holidayRepository.existsById(holidayId)) {
            throw new EntityNotFoundException("Holiday not found with id: " + holidayId);
        }
        holidayRepository.deleteById(holidayId);
    }

    private Holiday convertToHoliday(HolidayRequest request, HolidayPolicy policy) {
        Holiday holiday = new Holiday();
        holiday.setName(request.getName());
        holiday.setDate(request.getDate());
        if (request.getIsOptional() != null) {
            holiday.setIsOptional(request.getIsOptional());
        }
        if (request.getIsPaid() != null) {
            holiday.setIsPaid(request.getIsPaid());
        }
        holiday.setPolicy(policy);
        return holiday;
    }

    public Holiday addHolidayToPolicy(Long policyId, HolidayRequest request) {
        HolidayPolicy policy = holidayPolicyRepository.findById(policyId)
                .orElseThrow(() -> new EntityNotFoundException("HolidayPolicy not found with id: " + policyId));

        Holiday holiday = convertToHoliday(request, policy);
        return holidayRepository.save(holiday);
    }
}