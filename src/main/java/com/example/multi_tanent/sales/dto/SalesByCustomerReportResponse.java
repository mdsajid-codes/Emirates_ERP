package com.example.multi_tanent.sales.dto;

import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SalesByCustomerReportResponse {
    private List<SalesByCustomerReportItemDto> items;
    private Long totalCount;
    private Integer totalPages;
    private Integer currentPage;
    private Long totalInvoiceCount;
    private BigDecimal totalSalesAmount;
}
