package com.example.multi_tanent.fleet.dtos;

import com.example.multi_tanent.fleet.enums.InvoiceStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class InvoicePaymentUpdateRequest {
    private InvoiceStatus status;           // PAID / CANCELLED
    private LocalDate paymentReceivedDate;
    private String paymentMethod;           // CASH, CHEQUE, BANK_TRANSFER
    private String chequeNumber;
    private String otherReference;
    private String notes;
}
