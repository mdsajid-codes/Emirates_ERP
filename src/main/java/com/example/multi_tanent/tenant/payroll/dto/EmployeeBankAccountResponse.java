package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.EmployeeBankAccount;
import lombok.Data;

@Data
public class EmployeeBankAccountResponse {
    private Long id;
    private String bankName;
    private String accountNumber;
    private String ifscCode;
    private String accountHolderName;
    private Boolean isPrimary;
    private Long employeeId;

    public static EmployeeBankAccountResponse fromEntity(EmployeeBankAccount account) {
        if (account == null) return null;
        EmployeeBankAccountResponse dto = new EmployeeBankAccountResponse();
        dto.setId(account.getId());
        dto.setBankName(account.getBankName());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setIfscCode(account.getIfscCode());
        dto.setAccountHolderName(account.getAccountHolderName());
        dto.setIsPrimary(account.getIsPrimary());
        if (account.getEmployee() != null) {
            dto.setEmployeeId(account.getEmployee().getId());
        }
        return dto;
    }
}