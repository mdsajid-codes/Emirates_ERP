package com.example.multi_tanent.sales.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DelaySalesReportResponse {
    private List<DelaySalesReportItemDto> items;
    private Long totalCount;
    private Integer totalPages;
    private Integer currentPage;
}
