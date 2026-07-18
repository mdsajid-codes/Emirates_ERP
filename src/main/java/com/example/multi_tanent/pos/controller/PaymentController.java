package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.dto.PaymentRequest;
import com.example.multi_tanent.pos.entity.Payment;
import com.example.multi_tanent.pos.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pos/sales/{saleId}/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Payment> addPaymentToSale(@PathVariable Long saleId, @Valid @RequestBody PaymentRequest paymentRequest) {
        Payment createdPayment = paymentService.addPayment(saleId, paymentRequest);
        URI location = ServletUriComponentsBuilder.fromCurrentContextPath().path("/api/pos/sales/{saleId}/payments/{paymentId}").buildAndExpand(saleId, createdPayment.getId()).toUri();
        return ResponseEntity.created(location).body(createdPayment);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<Payment>> getAllPaymentsForSale(@PathVariable Long saleId) {
        return ResponseEntity.ok(paymentService.getAllPaymentsForSale(saleId));
    }

    @DeleteMapping("/{paymentId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<Void> deletePayment(@PathVariable Long saleId, @PathVariable Long paymentId) {
        paymentService.deletePayment(saleId, paymentId);
        return ResponseEntity.noContent().build();
    }
}
