package com.example.multi_tanent.fleet.controller;

import java.util.List;

import com.example.multi_tanent.fleet.dtos.InvoiceCreateRequest;
import com.example.multi_tanent.fleet.dtos.InvoicePaymentUpdateRequest;
import com.example.multi_tanent.fleet.dtos.TripInvoiceResponse;
import com.example.multi_tanent.fleet.entity.TripInvoice;
import com.example.multi_tanent.fleet.repository.TripInvoiceRepository;
import com.example.multi_tanent.fleet.service.TripInvoicePdfService;
import com.example.multi_tanent.fleet.service.TripInvoiceService;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fleet/trip-invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripInvoiceController {

    private final TripInvoiceService service;
    private final TripInvoicePdfService pdfService;
    private final TripInvoiceRepository repository;

    @PostMapping
    public ResponseEntity<TripInvoiceResponse> generateInvoice(@Valid @RequestBody InvoiceCreateRequest request) {
        return ResponseEntity.ok(service.generateInvoice(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripInvoiceResponse> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getInvoiceById(id));
    }

    @PatchMapping("/{id}/payment")
    public ResponseEntity<TripInvoiceResponse> updateInvoicePayment(
            @PathVariable Long id,
            @RequestBody InvoicePaymentUpdateRequest request) {
        return ResponseEntity.ok(service.updateInvoicePayment(id, request));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<TripInvoiceResponse> cancelInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancelInvoice(id));
    }

    @GetMapping
    @Operation(summary = "List all trip invoices for the current tenant with filtering and pagination")
    public ResponseEntity<org.springframework.data.domain.Page<TripInvoiceResponse>> getAllInvoices(
            @RequestParam(required = false) com.example.multi_tanent.fleet.enums.InvoiceStatus status,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate start,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate end,
            org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(service.getAllInvoices(status, customerId, start, end, pageable));
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Download invoice as PDF")
    public ResponseEntity<byte[]> getInvoicePdf(@PathVariable Long id) {
        TripInvoice invoice = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        byte[] pdfContent = pdfService.generateInvoicePdf(invoice);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=invoice-" + invoice.getInvoiceNumber() + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfContent);
    }
}
