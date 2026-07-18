package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsClientDocumentRequest;
import com.example.multi_tanent.ats.dto.AtsClientDocumentResponse;
import com.example.multi_tanent.ats.services.AtsClientDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ats/clients/{clientId}/documents")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsClientDocumentController {

    private final AtsClientDocumentService documentService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable Long clientId,
            @RequestParam("file") MultipartFile file) {
        String filePath = documentService.uploadFile(clientId, file);
        return ResponseEntity.ok(Map.of("filePath", filePath));
    }

    @PostMapping
    public ResponseEntity<AtsClientDocumentResponse> create(
            @PathVariable Long clientId,
            @Valid @RequestBody AtsClientDocumentRequest request) {
        return new ResponseEntity<>(documentService.create(clientId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsClientDocumentResponse>> list(@PathVariable Long clientId) {
        return ResponseEntity.ok(documentService.getAllForClient(clientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsClientDocumentResponse> get(
            @PathVariable Long clientId,
            @PathVariable Long id) {
        return ResponseEntity.ok(documentService.getById(clientId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsClientDocumentResponse> update(
            @PathVariable Long clientId,
            @PathVariable Long id,
            @Valid @RequestBody AtsClientDocumentRequest request) {
        return ResponseEntity.ok(documentService.update(clientId, id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long clientId, @PathVariable Long id) {
        documentService.delete(clientId, id);
    }
}
