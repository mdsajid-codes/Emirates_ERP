package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsApplicantWorkExperienceRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantWorkExperienceResponse;
import com.example.multi_tanent.ats.services.AtsApplicantWorkExperienceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/applicants/{applicantId}/work-experiences")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsApplicantWorkExperienceController {

    private final AtsApplicantWorkExperienceService workExperienceService;

    @PostMapping
    public ResponseEntity<AtsApplicantWorkExperienceResponse> create(
            @PathVariable Long applicantId,
            @Valid @RequestBody AtsApplicantWorkExperienceRequest request) {
        return new ResponseEntity<>(workExperienceService.create(applicantId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsApplicantWorkExperienceResponse>> list(@PathVariable Long applicantId) {
        return ResponseEntity.ok(workExperienceService.getAllForApplicant(applicantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsApplicantWorkExperienceResponse> get(
            @PathVariable Long applicantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(workExperienceService.getById(applicantId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsApplicantWorkExperienceResponse> update(
            @PathVariable Long applicantId,
            @PathVariable Long id,
            @Valid @RequestBody AtsApplicantWorkExperienceRequest request) {
        return ResponseEntity.ok(workExperienceService.update(applicantId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long applicantId, @PathVariable Long id) {
        workExperienceService.delete(applicantId, id);
    }
}
