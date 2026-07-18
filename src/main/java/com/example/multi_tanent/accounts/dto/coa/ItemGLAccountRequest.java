package com.example.multi_tanent.accounts.dto.coa;

import lombok.Data;

@Data
public class ItemGLAccountRequest {
    private Long itemId;
    private Long glAccountId;
    private Long goodsOnConsignmentAccountId;
    private Long salesRevenueAccountId;
    private Long tradeDiscountsAccountId;
    private Long costOfGoodsSoldAccountId;
    private Long deferredExpensesAccountId;
    private Long outputVatAccountId;
    private Long inputVatAccountId;
}
