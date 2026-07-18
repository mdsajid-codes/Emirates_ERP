package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsPaymentTermsRequest;
import com.example.multi_tanent.ats.dto.AtsPaymentTermsResponse;
import com.example.multi_tanent.ats.services.AtsPaymentTermsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/payment-terms")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsPaymentTermsController {

    private final AtsPaymentTermsService paymentTermsService;

    @PostMapping
    public ResponseEntity<AtsPaymentTermsResponse> create(@Valid @RequestBody AtsPaymentTermsRequest request) {
        return new ResponseEntity<>(paymentTermsService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsPaymentTermsResponse>> getAll() {
        return ResponseEntity.ok(paymentTermsService.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<AtsPaymentTermsResponse>> getAllActive() {
        return ResponseEntity.ok(paymentTermsService.getAllActive());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<AtsPaymentTermsResponse>> getPage(Pageable pageable) {
        return ResponseEntity.ok(paymentTermsService.getPage(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsPaymentTermsResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentTermsService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsPaymentTermsResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AtsPaymentTermsRequest request) {
        return ResponseEntity.ok(paymentTermsService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        paymentTermsService.delete(id);
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<AtsPaymentTermsResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(paymentTermsService.toggleActive(id));
    }
}
