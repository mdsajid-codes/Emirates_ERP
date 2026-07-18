package com.example.multi_tanent.sales.dto;

import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SalesByItemReportItemDto {
    private String itemName;
    private BigDecimal quantity;
    private String uom;
    private BigDecimal amount;
    private BigDecimal averagePrice;

    public SalesByItemReportItemDto(String itemName, BigDecimal quantity, String uom, BigDecimal amount) {
        this.itemName = itemName;
        this.quantity = quantity;
        this.uom = uom;
        this.amount = amount;
    }
}
