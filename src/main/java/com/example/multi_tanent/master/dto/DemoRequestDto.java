package com.example.multi_tanent.master.dto;

import lombok.Data;

@Data
public class DemoRequestDto {

    private String fullName;
    private String email;
    private String phone;
    private String company;

    /** Free-form module identifier sent by the requesting page: "POS", "HRMS", "CRM", etc. */
    private String module;

    /** Number of POS terminals, e.g. "1-2 terminals" (POS-specific, nullable for other modules) */
    private String terminals;

    /** Business type, e.g. "Retail Store" */
    private String businessType;

    private String message;
    private String source;
}
