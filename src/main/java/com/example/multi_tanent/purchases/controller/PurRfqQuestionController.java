package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurRfqQuestionRequest;
import com.example.multi_tanent.purchases.dto.PurRfqQuestionResponse;
import com.example.multi_tanent.purchases.service.PurRfqQuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchases/rfq-questions")
@RequiredArgsConstructor
public class PurRfqQuestionController {

    private final PurRfqQuestionService service;

    @PostMapping
    public ResponseEntity<PurRfqQuestionResponse> create(@RequestBody PurRfqQuestionRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @GetMapping
    public ResponseEntity<Page<PurRfqQuestionResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(service.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurRfqQuestionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurRfqQuestionResponse> update(@PathVariable Long id, @RequestBody PurRfqQuestionRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
