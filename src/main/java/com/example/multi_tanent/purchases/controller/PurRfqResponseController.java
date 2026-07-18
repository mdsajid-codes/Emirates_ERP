package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurRfqResponseRequest;
import com.example.multi_tanent.purchases.dto.PurRfqResponseResponse;
import com.example.multi_tanent.purchases.service.PurRfqResponseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/purchases/rfq-response")
@RequiredArgsConstructor
public class PurRfqResponseController {

    private final PurRfqResponseService service;

    @PostMapping("/rfq/{rfqId}")
    public ResponseEntity<PurRfqResponseResponse> submitResponse(
            @PathVariable Long rfqId,
            @RequestBody PurRfqResponseRequest request) {
        
        String resNumber = "RES-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return ResponseEntity.ok(service.submitResponse(rfqId, request, resNumber));
    }

    @GetMapping("/rfq/{rfqId}")
    public ResponseEntity<PurRfqResponseResponse> getByRfqId(@PathVariable Long rfqId) {
        return ResponseEntity.ok(service.getResponseByRfqId(rfqId));
    }
}
