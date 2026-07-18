package com.example.multi_tanent.sales.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class DelaySalesReportItemDto {
    private String salesPersonName;
    private String soNo;
    private LocalDate soDate;
    private LocalDate shipmentDate; // mapped from dateOfSupply
    private String customerName;
    private String invoiceNo;
    private LocalDate invoiceDate;
    private String delayReason;
}
