package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.Expense;
import com.example.multi_tanent.tenant.payroll.enums.ExpenseStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class ExpenseResponse {
    private Long id;
    private String employeeCode;
    private String employeeName;
    private LocalDate expenseDate;
    private String category;
    private BigDecimal amount;
    private String description;
    private String billNumber;
    private String merchentName;
    private List<ExpenseFileResponse> attachments;
    private ExpenseStatus status;
    private LocalDateTime submittedAt;
    private LocalDateTime processedAt;
    private Long processedByUserId;

    public static ExpenseResponse fromEntity(Expense expense) {
        ExpenseResponse dto = new ExpenseResponse();
        dto.setId(expense.getId());
        if (expense.getEmployee() != null) {
            dto.setEmployeeCode(expense.getEmployee().getEmployeeCode());
            dto.setEmployeeName(expense.getEmployee().getFirstName() + " " + expense.getEmployee().getLastName());
        }
        dto.setExpenseDate(expense.getExpenseDate());
        dto.setCategory(expense.getCategory());
        dto.setAmount(expense.getAmount());
        dto.setDescription(expense.getDescription());
        dto.setBillNumber(expense.getBillNumber());
        dto.setMerchentName(expense.getMerchantName());
        if (expense.getAttachments() != null) {
            dto.setAttachments(expense.getAttachments().stream()
                    .map(ExpenseFileResponse::fromEntity).collect(Collectors.toList()));
        }
        dto.setStatus(expense.getStatus());
        dto.setSubmittedAt(expense.getSubmittedAt());
        dto.setProcessedAt(expense.getProcessedAt());
        dto.setProcessedByUserId(expense.getProcessedByUserId());
        return dto;
    }
}