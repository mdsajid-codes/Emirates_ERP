package com.example.multi_tanent.master.controller;

import com.example.multi_tanent.master.dto.TenantSubscriptionInvoiceRequest;
import com.example.multi_tanent.master.dto.TenantSubscriptionInvoiceResponse;
import com.example.multi_tanent.master.service.TenantInvoicePdfService;
import com.example.multi_tanent.master.service.TenantSubscriptionInvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/master/invoices")
@RequiredArgsConstructor
public class TenantSubscriptionInvoiceController {

    private final TenantSubscriptionInvoiceService invoiceService;
    private final TenantInvoicePdfService pdfService;

    @PostMapping("/{masterTenantId}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantSubscriptionInvoiceResponse> createInvoice(
            @PathVariable Long masterTenantId,
            @RequestBody TenantSubscriptionInvoiceRequest request) {
        return ResponseEntity.ok(invoiceService.createInvoice(masterTenantId, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantSubscriptionInvoiceResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam com.example.multi_tanent.master.entity.PaymentStatus status) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, status));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<TenantSubscriptionInvoiceResponse> getInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getInvoice(id));
    }

    @GetMapping("/tenant/{masterTenantId}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<java.util.List<TenantSubscriptionInvoiceResponse>> getAllInvoices(
            @PathVariable Long masterTenantId) {
        return ResponseEntity.ok(invoiceService.getAllInvoices(masterTenantId));
    }

    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long id) throws IOException {
        byte[] pdfBytes = pdfService.generateInvoicePdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("filename", "invoice_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
