package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.tenant.payroll.dto.PayrollSettingRequest;
import com.example.multi_tanent.tenant.payroll.entity.PayrollSetting;
import com.example.multi_tanent.tenant.payroll.repository.PayrollSettingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(transactionManager = "tenantTx")
public class PayrollSettingService {

    private final PayrollSettingRepository payrollSettingRepository;

    public PayrollSettingService(PayrollSettingRepository payrollSettingRepository) {
        this.payrollSettingRepository = payrollSettingRepository;
    }

    public PayrollSetting getPayrollSetting() {
        // There should only be one setting record per tenant
        return payrollSettingRepository.findAll().stream().findFirst().orElse(null);
    }

    public PayrollSetting createOrUpdatePayrollSetting(PayrollSettingRequest request) {
        PayrollSetting setting = getPayrollSetting();
        if (setting == null) {
            setting = new PayrollSetting();
        }
        mapRequestToEntity(request, setting);
        return payrollSettingRepository.save(setting);
    }

    private void mapRequestToEntity(PayrollSettingRequest request, PayrollSetting entity) {
        entity.setPayFrequency(request.getPayFrequency());
        entity.setPayCycleDay(request.getPayCycleDay());
        entity.setPayslipGenerationDay(request.getPayslipGenerationDay());
        entity.setIncludeHolidaysInPayslip(request.getIncludeHolidaysInPayslip());
        entity.setIncludeLeaveBalanceInPayslip(request.getIncludeLeaveBalanceInPayslip());
    }
}