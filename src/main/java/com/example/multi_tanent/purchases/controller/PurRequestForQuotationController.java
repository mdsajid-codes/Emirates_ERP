package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurRequestForQuotationRequest;
import com.example.multi_tanent.purchases.dto.PurRequestForQuotationResponse;
import com.example.multi_tanent.purchases.service.PurRequestForQuotationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/purchases/rfq")
@RequiredArgsConstructor
public class PurRequestForQuotationController {

    private final PurRequestForQuotationService service;

    @PostMapping("/tendering/{tenderingId}/supplier/{supplierId}")
    public ResponseEntity<PurRequestForQuotationResponse> create(
            @PathVariable Long tenderingId,
            @PathVariable Long supplierId,
            @RequestBody PurRequestForQuotationRequest request) {

        String rfqNumber = "RFQ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return ResponseEntity.ok(service.create(request, rfqNumber, tenderingId, supplierId));
    }

    @GetMapping("/tendering/{tenderingId}")
    public ResponseEntity<List<PurRequestForQuotationResponse>> listByTendering(@PathVariable Long tenderingId) {
        return ResponseEntity.ok(service.listByTenderingId(tenderingId));
    }
}
