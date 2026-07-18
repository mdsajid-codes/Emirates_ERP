package com.example.multi_tanent.accounts.dto.vat;

import lombok.Data;

@Data
public class VatTypeRequest {
    private String name;
    private Long vatGroupId;
    private Long receivableGlAccountId;
    private Long payableGlAccountId;
}
