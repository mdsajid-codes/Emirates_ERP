package com.example.multi_tanent.accounts.dto.subledger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventorySubLedgerSummary {
    private Long itemId;
    private String itemName;
    private String itemSku;
    private BigDecimal totalDebit;  // Value in
    private BigDecimal totalCredit; // Value out
    private BigDecimal netValue;    // Net balance
    private BigDecimal totalQtyIn;
    private BigDecimal totalQtyOut;
    private BigDecimal netQty;
}
