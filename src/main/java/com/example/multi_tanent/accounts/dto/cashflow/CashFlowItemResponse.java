package com.example.multi_tanent.accounts.dto.cashflow;

import com.example.multi_tanent.accounts.entity.enums.CashFlowCategory;
import lombok.Data;

@Data
public class CashFlowItemResponse {
    private Long id;
    private String name;
    private CashFlowCategory category;
    private Integer displayOrder;
    private Boolean isInflow;
    private String tenantId;
}
