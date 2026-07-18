package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.LoanProduct;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class LoanProductResponse {
    private Long id;
    private String productName;
    private String description;
    private BigDecimal interestRate;
    private Integer maxInstallments;
    private BigDecimal maxLoanAmount;
    private Boolean isActive;
    private LocalDate availabilityStartDate;
    private LocalDate availabilityEndDate;
    private Boolean deductFromSalary;

    public static LoanProductResponse fromEntity(LoanProduct loanProduct) {
        if (loanProduct == null) return null;
        LoanProductResponse dto = new LoanProductResponse();
        dto.setId(loanProduct.getId());
        dto.setProductName(loanProduct.getProductName());
        dto.setDescription(loanProduct.getDescription());
        dto.setInterestRate(loanProduct.getInterestRate());
        dto.setMaxInstallments(loanProduct.getMaxInstallments());
        dto.setMaxLoanAmount(loanProduct.getMaxLoanAmount());
        dto.setIsActive(loanProduct.getIsActive());
        dto.setAvailabilityStartDate(loanProduct.getAvailabilityStartDate());
        dto.setAvailabilityEndDate(loanProduct.getAvailabilityEndDate());
        dto.setDeductFromSalary(loanProduct.getDeductFromSalary());
        return dto;
    }
}