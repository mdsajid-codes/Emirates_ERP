package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsApplicantEducationRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantEducationResponse;
import com.example.multi_tanent.ats.services.AtsApplicantEducationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/applicants/{applicantId}/educations")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsApplicantEducationController {

    private final AtsApplicantEducationService educationService;

    @PostMapping
    public ResponseEntity<AtsApplicantEducationResponse> create(
            @PathVariable Long applicantId,
            @Valid @RequestBody AtsApplicantEducationRequest request) {
        return new ResponseEntity<>(educationService.create(applicantId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsApplicantEducationResponse>> list(@PathVariable Long applicantId) {
        return ResponseEntity.ok(educationService.getAllForApplicant(applicantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsApplicantEducationResponse> get(
            @PathVariable Long applicantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(educationService.getById(applicantId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsApplicantEducationResponse> update(
            @PathVariable Long applicantId,
            @PathVariable Long id,
            @Valid @RequestBody AtsApplicantEducationRequest request) {
        return ResponseEntity.ok(educationService.update(applicantId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long applicantId, @PathVariable Long id) {
        educationService.delete(applicantId, id);
    }
}
