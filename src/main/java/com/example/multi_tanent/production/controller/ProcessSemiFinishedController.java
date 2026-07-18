package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProcessSemiFinishedRequest;
import com.example.multi_tanent.production.dto.ProcessSemiFinishedResponse;
import com.example.multi_tanent.production.services.ProcessSemiFinishedService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/production/process-semi-finished")
@RequiredArgsConstructor
public class ProcessSemiFinishedController {

    private final ProcessSemiFinishedService service;

    @PostMapping
    public ResponseEntity<ProcessSemiFinishedResponse> create(@RequestBody ProcessSemiFinishedRequest request) {
        return ResponseEntity.ok(service.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcessSemiFinishedResponse> update(@PathVariable Long id,
            @RequestBody ProcessSemiFinishedRequest request) {
        return ResponseEntity.ok(service.update(id, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcessSemiFinishedResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/semi-finished/{semiFinishedId}")
    public ResponseEntity<ProcessSemiFinishedResponse> getBySemiFinishedId(@PathVariable Long semiFinishedId) {
        return ResponseEntity.ok(service.getBySemiFinishedId(semiFinishedId));
    }

    @GetMapping
    public ResponseEntity<Page<ProcessSemiFinishedResponse>> getAll(Pageable pageable) {
        return ResponseEntity.ok(service.getAll(pageable));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
