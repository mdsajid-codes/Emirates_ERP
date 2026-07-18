package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsInterviewerRequest;
import com.example.multi_tanent.ats.dto.AtsInterviewerResponse;
import com.example.multi_tanent.ats.services.AtsInterviewerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/interviewers")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsInterviewerController {

    private final AtsInterviewerService interviewerService;

    @PostMapping
    public ResponseEntity<AtsInterviewerResponse> create(@Valid @RequestBody AtsInterviewerRequest request) {
        return new ResponseEntity<>(interviewerService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<AtsInterviewerResponse>> getPage(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(interviewerService.getPage(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsInterviewerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(interviewerService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsInterviewerResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AtsInterviewerRequest request) {
        return ResponseEntity.ok(interviewerService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        interviewerService.delete(id);
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<AtsInterviewerResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(interviewerService.toggleActive(id));
    }
}
