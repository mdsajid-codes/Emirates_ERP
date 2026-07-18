package com.example.multi_tanent.tenant.payroll.dto;

import com.example.multi_tanent.tenant.payroll.enums.PaymentMethod;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;
import java.math.BigDecimal;

@Data
public class ProvisionPayoutRequest {
    @NotNull(message = "Paid out date is required.")
    private LocalDate paidOutDate;

    @NotNull(message = "Paid amount is required.")
    @Positive(message = "Paid amount must be positive.")
    private BigDecimal paidAmount;

    @NotBlank(message = "Payment details are required.")
    private String paymentDetails;

    @NotNull(message = "Payment method is required.")
    private PaymentMethod paymentMethod;
}