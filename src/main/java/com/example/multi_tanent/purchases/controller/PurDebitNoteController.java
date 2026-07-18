package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurDebitNoteRequest;
import com.example.multi_tanent.purchases.dto.PurDebitNoteResponse;
import com.example.multi_tanent.purchases.service.PurDebitNoteService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/purchases/debit-notes")
@RequiredArgsConstructor
public class PurDebitNoteController {

    private final PurDebitNoteService service;
    private final ObjectMapper objectMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PurDebitNoteResponse> create(
            @RequestPart("request") String requestStr,
            @RequestPart(value = "files", required = false) MultipartFile[] files) throws JsonProcessingException {
        PurDebitNoteRequest request = objectMapper.readValue(requestStr, PurDebitNoteRequest.class);
        return ResponseEntity.ok(service.create(request, files));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PurDebitNoteResponse> update(
            @PathVariable Long id,
            @RequestPart("request") String requestStr,
            @RequestPart(value = "files", required = false) MultipartFile[] files) throws JsonProcessingException {
        PurDebitNoteRequest request = objectMapper.readValue(requestStr, PurDebitNoteRequest.class);
        return ResponseEntity.ok(service.update(id, request, files));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurDebitNoteResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping
    public ResponseEntity<Page<PurDebitNoteResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
