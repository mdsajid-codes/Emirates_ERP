package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmDealSummaryDto {
    private Long id;
    private String quotationNumber;
    private String customerName;
    private String salespersonName;
    private BigDecimal netTotal;
    private SalesStatus status;
    private OffsetDateTime createdAt;
}
