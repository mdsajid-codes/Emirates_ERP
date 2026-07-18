package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsActionRequest;
import com.example.multi_tanent.ats.dto.AtsActionResponse;
import com.example.multi_tanent.ats.services.AtsActionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/actions")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsActionController {

    private final AtsActionService actionService;

    @PostMapping
    public ResponseEntity<AtsActionResponse> create(@Valid @RequestBody AtsActionRequest request) {
        return new ResponseEntity<>(actionService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsActionResponse>> getAll() {
        return ResponseEntity.ok(actionService.getAll());
    }

    @GetMapping("/active")
    public ResponseEntity<List<AtsActionResponse>> getAllActive() {
        return ResponseEntity.ok(actionService.getAllActive());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<AtsActionResponse>> getPage(Pageable pageable) {
        return ResponseEntity.ok(actionService.getPage(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsActionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(actionService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsActionResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AtsActionRequest request) {
        return ResponseEntity.ok(actionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        actionService.delete(id);
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<AtsActionResponse> toggleActive(@PathVariable Long id) {
        return ResponseEntity.ok(actionService.toggleActive(id));
    }
}
