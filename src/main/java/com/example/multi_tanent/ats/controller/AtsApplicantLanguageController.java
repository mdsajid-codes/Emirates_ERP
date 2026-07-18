package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsApplicantLanguageRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantLanguageResponse;
import com.example.multi_tanent.ats.services.AtsApplicantLanguageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/applicants/{applicantId}/languages")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsApplicantLanguageController {

    private final AtsApplicantLanguageService languageService;

    @PostMapping
    public ResponseEntity<AtsApplicantLanguageResponse> create(
            @PathVariable Long applicantId,
            @Valid @RequestBody AtsApplicantLanguageRequest request) {
        return new ResponseEntity<>(languageService.create(applicantId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsApplicantLanguageResponse>> list(@PathVariable Long applicantId) {
        return ResponseEntity.ok(languageService.getAllForApplicant(applicantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsApplicantLanguageResponse> get(
            @PathVariable Long applicantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(languageService.getById(applicantId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsApplicantLanguageResponse> update(
            @PathVariable Long applicantId,
            @PathVariable Long id,
            @Valid @RequestBody AtsApplicantLanguageRequest request) {
        return ResponseEntity.ok(languageService.update(applicantId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long applicantId, @PathVariable Long id) {
        languageService.delete(applicantId, id);
    }
}
