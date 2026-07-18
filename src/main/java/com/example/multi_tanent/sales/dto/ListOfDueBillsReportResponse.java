package com.example.multi_tanent.sales.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ListOfDueBillsReportResponse {
    private List<ListOfDueBillsReportItemDto> items;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private BigDecimal totalAmount;
    private BigDecimal totalPendingAmount;
}
