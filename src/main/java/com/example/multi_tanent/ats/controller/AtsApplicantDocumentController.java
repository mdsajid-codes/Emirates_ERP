package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsApplicantDocumentRequest;
import com.example.multi_tanent.ats.dto.AtsApplicantDocumentResponse;
import com.example.multi_tanent.ats.services.AtsApplicantDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;
import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/api/ats/applicants/{applicantId}/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsApplicantDocumentController {

    private final AtsApplicantDocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable Long applicantId,
            @RequestParam("file") MultipartFile file) {
        String filePath = documentService.uploadFile(applicantId, file);
        return ResponseEntity.ok(Map.of("filePath", filePath));
    }

    @PostMapping
    public ResponseEntity<AtsApplicantDocumentResponse> create(
            @PathVariable Long applicantId,
            @Valid @RequestBody AtsApplicantDocumentRequest request) {
        return new ResponseEntity<>(documentService.create(applicantId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsApplicantDocumentResponse>> list(@PathVariable Long applicantId) {
        return ResponseEntity.ok(documentService.getAllForApplicant(applicantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsApplicantDocumentResponse> get(
            @PathVariable Long applicantId,
            @PathVariable Long id) {
        return ResponseEntity.ok(documentService.getById(applicantId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsApplicantDocumentResponse> update(
            @PathVariable Long applicantId,
            @PathVariable Long id,
            @Valid @RequestBody AtsApplicantDocumentRequest request) {
        return ResponseEntity.ok(documentService.update(applicantId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long applicantId, @PathVariable Long id) {
        documentService.delete(applicantId, id);
    }
}
