package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.Payslip;
import com.example.multi_tanent.tenant.payroll.enums.PayrollStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class PayslipResponse {
    private Long id;
    private String employeeCode;
    private int year;
    private int month;
    private LocalDate payDate;
    private BigDecimal grossEarnings;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;
    private PayrollStatus status;
    private List<PayslipComponentResponse> components;

    public static PayslipResponse fromEntity(Payslip payslip) {
        PayslipResponse dto = new PayslipResponse();
        dto.setId(payslip.getId());
        dto.setEmployeeCode(payslip.getEmployee().getEmployeeCode());
        dto.setYear(payslip.getYear());
        dto.setMonth(payslip.getMonth());
        dto.setPayDate(payslip.getPayDate());
        dto.setGrossEarnings(payslip.getGrossEarnings());
        dto.setTotalDeductions(payslip.getTotalDeductions());
        dto.setNetSalary(payslip.getNetSalary());
        dto.setStatus(payslip.getStatus());

        if (payslip.getComponents() != null) {
            dto.setComponents(payslip.getComponents().stream().map(c -> {
                PayslipComponentResponse compDto = new PayslipComponentResponse();
                compDto.setComponentName(c.getSalaryComponent().getName());
                compDto.setComponentCode(c.getSalaryComponent().getCode());
                compDto.setComponentType(c.getSalaryComponent().getType());
                compDto.setAmount(c.getAmount());
                return compDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}