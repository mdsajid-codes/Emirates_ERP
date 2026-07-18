package com.example.multi_tanent.fleet.dtos;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TripInvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private Long customerId;
    private String customerName;
    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private BigDecimal subTotalAmount;
    private BigDecimal totalTokenAmount;
    private BigDecimal totalOtherCharges;
    private BigDecimal totalVatAmount;
    private BigDecimal grandTotal;
    private String status;
    private LocalDate paymentReceivedDate;
    private String paymentMethod;
    private String chequeNumber;
    private String otherReference;
    private String notes;
    private Integer tripCount;
    private Boolean isOverdue;
    private java.util.List<TripResponse> trips;
}