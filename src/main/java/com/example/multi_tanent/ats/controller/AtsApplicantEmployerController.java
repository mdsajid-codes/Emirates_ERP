package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsApplicantEmployerRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantEmployerResponse;
import com.example.multi_tanent.ats.services.AtsApplicantEmployerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/applicants/{applicantId}/employers")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsApplicantEmployerController {

    private final AtsApplicantEmployerService employerService;

    @PostMapping
    public ResponseEntity<AtsApplicantEmployerResponse> create(
            @PathVariable Long applicantId,
            @Valid @RequestBody AtsApplicantEmployerRequest request) {
        return new ResponseEntity<>(employerService.create(applicantId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsApplicantEmployerResponse>> list(@PathVariable Long applicantId) {
        return ResponseEntity.ok(employerService.getAllForApplicant(applicantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsApplicantEmployerResponse> get(
            @PathVariable Long applicantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(employerService.getById(applicantId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsApplicantEmployerResponse> update(
            @PathVariable Long applicantId,
            @PathVariable Long id,
            @Valid @RequestBody AtsApplicantEmployerRequest request) {
        return ResponseEntity.ok(employerService.update(applicantId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long applicantId, @PathVariable Long id) {
        employerService.delete(applicantId, id);
    }
}
