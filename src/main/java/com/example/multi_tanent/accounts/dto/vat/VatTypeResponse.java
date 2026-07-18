package com.example.multi_tanent.accounts.dto.vat;

import lombok.Data;

@Data
public class VatTypeResponse {
    private Long id;
    private String name;
    private Long vatGroupId;
    private String vatGroupName;
    private Long receivableGlAccountId;
    private String receivableGlAccountName;
    private Long payableGlAccountId;
    private String payableGlAccountName;
}
