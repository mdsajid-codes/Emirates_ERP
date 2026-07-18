package com.example.multi_tanent.accounts.dto.payment;

import com.example.multi_tanent.accounts.entity.enums.CashFlowCategory;
import lombok.Data;

@Data
public class AccCashFlowItemResponse {
    private Long id;
    private String name;
    private CashFlowCategory category;
    private Boolean isInflow;
    private Integer displayOrder;
    private String tenantId;
}
