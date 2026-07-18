package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsApplicantRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantResponse;
import com.example.multi_tanent.ats.services.AtsApplicantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/applicants")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsApplicantController {

    private final AtsApplicantService applicantService;

    @PostMapping
    public ResponseEntity<AtsApplicantResponse> create(@Valid @RequestBody AtsApplicantRequest request) {
        return new ResponseEntity<>(applicantService.createApplicant(request), HttpStatus.CREATED);
    }

    @GetMapping
    public Page<AtsApplicantResponse> list(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return applicantService.getAllApplicants(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsApplicantResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(applicantService.getApplicantById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsApplicantResponse> update(@PathVariable Long id, @Valid @RequestBody AtsApplicantRequest request) {
        return ResponseEntity.ok(applicantService.updateApplicant(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        applicantService.deleteApplicant(id);
    }

    @PostMapping("/{id}/blacklist")
    public ResponseEntity<AtsApplicantResponse> blacklist(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(applicantService.blacklistApplicant(id, reason));
    }
}
