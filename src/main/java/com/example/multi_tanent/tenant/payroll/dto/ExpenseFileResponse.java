package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.entity.ExpenseFile;
import lombok.Data;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Data
public class ExpenseFileResponse {
    private Long id;
    private String originalFilename;
    private String viewUrl;

    public static ExpenseFileResponse fromEntity(ExpenseFile expenseFile) {
        ExpenseFileResponse dto = new ExpenseFileResponse();
        dto.setId(expenseFile.getId());
        dto.setOriginalFilename(expenseFile.getOriginalFilename());

        // Construct the full URL to view the file
        String url = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/api/expenses/attachments/{fileId}")
                .buildAndExpand(expenseFile.getId())
                .toUriString();
        dto.setViewUrl(url);
        return dto;
    }
}