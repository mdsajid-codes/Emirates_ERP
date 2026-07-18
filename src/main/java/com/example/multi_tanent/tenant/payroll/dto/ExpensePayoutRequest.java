package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class ExpensePayoutRequest {
    @NotNull(message = "Payment method is required.")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Paid out date is required.")
    private LocalDate paidOutDate;

    private String paymentDetails; // e.g., Transaction ID, Cheque No.
}