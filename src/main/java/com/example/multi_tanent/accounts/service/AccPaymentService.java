package com.example.multi_tanent.accounts.service;

import com.example.multi_tanent.accounts.dto.payment.AccPaymentRequest;
import com.example.multi_tanent.accounts.dto.payment.AccPaymentResponse;

import java.util.List;

public interface AccPaymentService {
    AccPaymentResponse createPayment(AccPaymentRequest request, String tenantId);
    AccPaymentResponse postPayment(Long id, String tenantId);
    AccPaymentResponse getPayment(Long id, String tenantId);
    List<AccPaymentResponse> getAllPayments(String tenantId);
    List<com.example.multi_tanent.accounts.dto.payment.PaymentRegisterResponse> getPaymentRegister(String tenantId);
}
