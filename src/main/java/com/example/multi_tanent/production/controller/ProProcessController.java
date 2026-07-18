package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProProcessRequest;
import com.example.multi_tanent.production.dto.ProProcessResponse;
import com.example.multi_tanent.production.services.ProProcessService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/production/processes")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ProProcessController {

    private final ProProcessService processService;

    @PostMapping
    public ResponseEntity<ProProcessResponse> createProcess(@Valid @RequestBody ProProcessRequest request) {
        return new ResponseEntity<>(processService.createProcess(request), HttpStatus.CREATED);
    }

    @GetMapping
    public Page<ProProcessResponse> getAllProcesses(@PageableDefault(size = 10) Pageable pageable) {
        return processService.getAllProcesses(pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProProcessResponse> getProcessById(@PathVariable Long id) {
        return ResponseEntity.ok(processService.getProcessById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProProcessResponse> updateProcess(@PathVariable Long id, @Valid @RequestBody ProProcessRequest request) {
        return ResponseEntity.ok(processService.updateProcess(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProcess(@PathVariable Long id) {
        processService.deleteProcess(id);
        return ResponseEntity.noContent().build();
    }
}