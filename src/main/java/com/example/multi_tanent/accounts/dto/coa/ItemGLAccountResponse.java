package com.example.multi_tanent.accounts.dto.coa;

import lombok.Data;

@Data
public class ItemGLAccountResponse {
    private Long id;
    private Long itemId;
    private Long glAccountId;
    private String glAccountCode;
    private Long goodsOnConsignmentAccountId;
    private String goodsOnConsignmentAccountCode;
    private Long salesRevenueAccountId;
    private String salesRevenueAccountCode;
    private Long tradeDiscountsAccountId;
    private String tradeDiscountsAccountCode;
    private Long costOfGoodsSoldAccountId;
    private String costOfGoodsSoldAccountCode;
    private Long deferredExpensesAccountId;
    private String deferredExpensesAccountCode;
    private Long outputVatAccountId;
    private String outputVatAccountCode;
    private Long inputVatAccountId;
    private String inputVatAccountCode;
}
