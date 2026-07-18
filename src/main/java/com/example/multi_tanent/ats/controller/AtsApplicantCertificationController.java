package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsApplicantCertificationRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantCertificationResponse;
import com.example.multi_tanent.ats.services.AtsApplicantCertificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/applicants/{applicantId}/certifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsApplicantCertificationController {

    private final AtsApplicantCertificationService certificationService;

    @PostMapping
    public ResponseEntity<AtsApplicantCertificationResponse> create(
            @PathVariable Long applicantId,
            @Valid @RequestBody AtsApplicantCertificationRequest request) {
        return new ResponseEntity<>(certificationService.create(applicantId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsApplicantCertificationResponse>> list(@PathVariable Long applicantId) {
        return ResponseEntity.ok(certificationService.getAllForApplicant(applicantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsApplicantCertificationResponse> get(
            @PathVariable Long applicantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(certificationService.getById(applicantId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsApplicantCertificationResponse> update(
            @PathVariable Long applicantId,
            @PathVariable Long id,
            @Valid @RequestBody AtsApplicantCertificationRequest request) {
        return ResponseEntity.ok(certificationService.update(applicantId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long applicantId, @PathVariable Long id) {
        certificationService.delete(applicantId, id);
    }
}
