package com.example.multi_tanent.accounts.dto.vat;

import com.example.multi_tanent.accounts.entity.enums.OutOfScopeReason;
import com.example.multi_tanent.accounts.entity.enums.VatTypeEnum;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class VatRateRequest {
    private String name;
    private BigDecimal rate;
    private VatTypeEnum vatType;
    private OutOfScopeReason outOfScopeReason;
}
