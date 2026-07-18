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
public class SalesBySalesPersonReportItemDto {
    private String salesPersonName;
    private Long invoiceCount;
    private BigDecimal totalSales;
}
