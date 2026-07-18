package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorSubmissionFormatRequest;
import com.example.multi_tanent.ats.dto.AtsVendorSubmissionFormatResponse;
import com.example.multi_tanent.ats.services.AtsVendorSubmissionFormatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/vendors/{vendorId}/submission-format")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorSubmissionFormatController {

    private final AtsVendorSubmissionFormatService submissionFormatService;

    @GetMapping
    public ResponseEntity<AtsVendorSubmissionFormatResponse> get(@PathVariable Long vendorId) {
        return ResponseEntity.ok(submissionFormatService.get(vendorId));
    }

    @PutMapping
    public ResponseEntity<AtsVendorSubmissionFormatResponse> upsert(
            @PathVariable Long vendorId,
            @Valid @RequestBody AtsVendorSubmissionFormatRequest request) {
        return ResponseEntity.ok(submissionFormatService.upsert(vendorId, request));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long vendorId) {
        submissionFormatService.delete(vendorId);
    }
}
