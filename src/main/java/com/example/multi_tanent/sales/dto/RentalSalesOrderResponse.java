package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.sales.enums.SalesStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
public class RentalSalesOrderResponse {
    private Long id;
    private LocalDate orderDate;
    private Long customerId;
    private String customerName;
    private Long salespersonId;
    private String salespersonName;
    private String orderNumber;
    private String reference;
    private LocalDate shipmentDate;
    private LocalDate fromDate;
    private LocalDate toDate;
    private String deliveryLead;
    private String validity;
    private String paymentTerms;
    private String priceBasis;
    private String dearSir;
    private List<RentalSalesOrderItemResponse> items;
    private Integer rentalDurationDays;
    private BigDecimal subTotalPerDay;
    private BigDecimal totalRentalPrice;
    private BigDecimal totalDiscount;
    private BigDecimal grossTotal;
    private BigDecimal totalTax;
    private BigDecimal otherCharges;
    private BigDecimal netTotal;
    private String termsAndConditions;
    private String notes;
    private String manufacture;
    private String remarks;
    private List<String> attachments;
    private String emailTo;
    private SalesStatus status;
    private String template;
    private String createdBy;
    private String updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
