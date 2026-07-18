package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.EmployeeBenefitProvision;
import com.example.multi_tanent.tenant.payroll.entity.BenefitPayoutFile;
import com.example.multi_tanent.tenant.payroll.enums.CalculationType;
import com.example.multi_tanent.tenant.payroll.enums.ProvisionStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class EmployeeBenefitProvisionResponse {
    private Long id;
    private String employeeCode;
    private String benefitTypeName;
    private CalculationType calculationType;
    private BigDecimal valueForAccrual;
    private BigDecimal accruedAmount;
    private LocalDate cycleStartDate;
    private LocalDate cycleEndDate;
    private ProvisionStatus status;
    private LocalDate paidOutDate;
    private String paymentDetails;
    private List<PayoutFileResponse> confirmationFiles;

    @Data
    public static class PayoutFileResponse {
        private Long id;
        private String filePath;
        private String originalFilename;

        public static PayoutFileResponse fromEntity(BenefitPayoutFile fileEntity) {
            PayoutFileResponse fileDto = new PayoutFileResponse();
            fileDto.setId(fileEntity.getId());
            fileDto.setFilePath(fileEntity.getFilePath());
            fileDto.setOriginalFilename(fileEntity.getOriginalFilename());
            return fileDto;
        }
    }

    public static EmployeeBenefitProvisionResponse fromEntity(EmployeeBenefitProvision entity) {
        if (entity == null) return null;

        EmployeeBenefitProvisionResponse dto = new EmployeeBenefitProvisionResponse();
        dto.setId(entity.getId());
        if (entity.getEmployee() != null) {
            dto.setEmployeeCode(entity.getEmployee().getEmployeeCode());
        }
        if (entity.getBenefitType() != null) {
            dto.setBenefitTypeName(entity.getBenefitType().getName());
            dto.setCalculationType(entity.getBenefitType().getCalculationType());
            dto.setValueForAccrual(entity.getBenefitType().getValueForAccrual());
        }
        dto.setAccruedAmount(entity.getAccruedAmount());
        dto.setCycleStartDate(entity.getCycleStartDate());
        dto.setCycleEndDate(entity.getCycleEndDate());
        dto.setStatus(entity.getStatus());
        dto.setPaidOutDate(entity.getPaidOutDate());
        dto.setPaymentDetails(entity.getPaymentDetails());
        if (entity.getConfirmationFiles() != null) {
            dto.setConfirmationFiles(entity.getConfirmationFiles().stream()
                    .map(PayoutFileResponse::fromEntity)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}