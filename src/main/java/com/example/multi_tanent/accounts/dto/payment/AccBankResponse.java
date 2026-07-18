package com.example.multi_tanent.accounts.dto.payment;

import lombok.Data;

@Data
public class AccBankResponse {
    private Long id;
    private String name;
    private String swiftCode;
    private String country;
    private String tenantId;
}
