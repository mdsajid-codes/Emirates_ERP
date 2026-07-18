package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class SalesOrderRequest {
    private LocalDate salesOrderDate;
    private Long customerId;
    private String reference;
    private String customerPoNo;
    private LocalDate customerPoDate;
    private Long salespersonId;
    private String saleType;
    private List<SalesOrderItemRequest> items;
    private String termsAndConditions;
    private String notes;
    private String emailTo;
    private SalesStatus status;
    private BigDecimal totalDiscount;
    private BigDecimal otherCharges;
    private String template;
}
