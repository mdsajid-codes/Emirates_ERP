package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.PayrollSetting;
import lombok.Data;

@Data
public class PayrollSettingResponse {
    private Long id;
    private String payFrequency;
    private Integer payCycleDay;
    private Integer payslipGenerationDay;
    private Boolean includeHolidaysInPayslip;
    private Boolean includeLeaveBalanceInPayslip;

    public static PayrollSettingResponse fromEntity(PayrollSetting setting) {
        if (setting == null) return null;
        PayrollSettingResponse dto = new PayrollSettingResponse();
        dto.setId(setting.getId());
        dto.setPayFrequency(setting.getPayFrequency());
        dto.setPayCycleDay(setting.getPayCycleDay());
        dto.setPayslipGenerationDay(setting.getPayslipGenerationDay());
        dto.setIncludeHolidaysInPayslip(setting.getIncludeHolidaysInPayslip());
        dto.setIncludeLeaveBalanceInPayslip(setting.getIncludeLeaveBalanceInPayslip());
        return dto;
    }
}