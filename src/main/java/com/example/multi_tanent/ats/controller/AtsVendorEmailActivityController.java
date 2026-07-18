package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorEmailActivityResponse;
import com.example.multi_tanent.ats.services.AtsVendorEmailActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/vendors/{vendorId}/email-activities")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorEmailActivityController {

    private final AtsVendorEmailActivityService emailActivityService;

    @GetMapping
    public ResponseEntity<List<AtsVendorEmailActivityResponse>> getAll(@PathVariable Long vendorId) {
        return ResponseEntity.ok(emailActivityService.getAll(vendorId));
    }

    @GetMapping("/{activityId}")
    public ResponseEntity<AtsVendorEmailActivityResponse> getById(
            @PathVariable Long vendorId,
            @PathVariable Long activityId) {
        return ResponseEntity.ok(emailActivityService.getById(vendorId, activityId));
    }
}
