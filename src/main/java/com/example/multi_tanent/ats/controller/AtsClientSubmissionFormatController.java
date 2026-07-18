package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsClientSubmissionFormatRequest;
import com.example.multi_tanent.ats.dto.AtsClientSubmissionFormatResponse;
import com.example.multi_tanent.ats.services.AtsClientSubmissionFormatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/clients/{clientId}/submission-format")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsClientSubmissionFormatController {

    private final AtsClientSubmissionFormatService submissionFormatService;

    @GetMapping
    public ResponseEntity<AtsClientSubmissionFormatResponse> get(@PathVariable Long clientId) {
        return ResponseEntity.ok(submissionFormatService.get(clientId));
    }

    @PutMapping
    public ResponseEntity<AtsClientSubmissionFormatResponse> upsert(
            @PathVariable Long clientId,
            @Valid @RequestBody AtsClientSubmissionFormatRequest request) {
        return ResponseEntity.ok(submissionFormatService.upsert(clientId, request));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long clientId) {
        submissionFormatService.delete(clientId);
    }
}
