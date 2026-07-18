package com.example.multi_tanent.accounts.controller;

import com.example.multi_tanent.accounts.dto.payment.AccPaymentRequest;
import com.example.multi_tanent.accounts.dto.payment.AccPaymentResponse;
import com.example.multi_tanent.accounts.service.AccPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/accounts/payments")
@RequiredArgsConstructor
public class AccPaymentController {

    private final AccPaymentService paymentService;

    @PostMapping
    public ResponseEntity<AccPaymentResponse> createPayment(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestBody AccPaymentRequest request) {
        return ResponseEntity.ok(paymentService.createPayment(request, tenantId));
    }

    @PostMapping("/{id}/post")
    public ResponseEntity<AccPaymentResponse> postPayment(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(paymentService.postPayment(id, tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccPaymentResponse> getPayment(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPayment(id, tenantId));
    }

    @GetMapping
    public ResponseEntity<List<AccPaymentResponse>> getAllPayments(
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(paymentService.getAllPayments(tenantId));
    }

    @GetMapping("/register")
    public ResponseEntity<List<com.example.multi_tanent.accounts.dto.payment.PaymentRegisterResponse>> getPaymentRegister(
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return ResponseEntity.ok(paymentService.getPaymentRegister(tenantId));
    }
}
