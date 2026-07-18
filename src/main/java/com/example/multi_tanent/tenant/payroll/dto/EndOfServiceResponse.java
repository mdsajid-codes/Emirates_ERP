package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.EndOfService;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class EndOfServiceResponse {
    private Long id;
    private String employeeCode;
    private LocalDate joiningDate;
    private LocalDate lastWorkingDay;
    private BigDecimal totalYearsOfService;
    private BigDecimal lastBasicSalary;
    private BigDecimal gratuityAmount;
    private String calculationDetails;
    private Boolean isPaid;
    private LocalDate paymentDate;
    private LocalDateTime calculatedAt;

    public static EndOfServiceResponse fromEntity(EndOfService entity) {
        if (entity == null) return null;

        EndOfServiceResponse dto = new EndOfServiceResponse();
        dto.setId(entity.getId());
        if (entity.getEmployee() != null) {
            dto.setEmployeeCode(entity.getEmployee().getEmployeeCode());
        }
        dto.setJoiningDate(entity.getJoiningDate());
        dto.setLastWorkingDay(entity.getLastWorkingDay());
        dto.setTotalYearsOfService(entity.getTotalYearsOfService());
        dto.setLastBasicSalary(entity.getLastBasicSalary());
        dto.setGratuityAmount(entity.getGratuityAmount());
        dto.setCalculationDetails(entity.getCalculationDetails());
        dto.setIsPaid(entity.getIsPaid());
        dto.setPaymentDate(entity.getPaymentDate());
        dto.setCalculatedAt(entity.getCalculatedAt());
        return dto;
    }
}