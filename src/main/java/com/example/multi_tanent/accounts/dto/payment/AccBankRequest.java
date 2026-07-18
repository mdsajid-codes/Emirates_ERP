package com.example.multi_tanent.accounts.dto.payment;

import lombok.Data;

@Data
public class AccBankRequest {
    private String name;
    private String swiftCode;
    private String country;
}
