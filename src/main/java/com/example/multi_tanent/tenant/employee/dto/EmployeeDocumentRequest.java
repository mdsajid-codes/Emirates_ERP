package com.example.multi_tanent.tenant.employee.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class EmployeeDocumentRequest {
    private Long docTypeId;
    private String documentId;
    private LocalDate registrationDate;
    private LocalDate endDate;
    private String remarks;
    private Boolean verified;
}