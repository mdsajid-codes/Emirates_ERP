package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsAiProviderRequest;
import com.example.multi_tanent.ats.dto.AtsAiProviderResponse;
import com.example.multi_tanent.ats.services.AtsAiProviderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/ai-providers")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsAiProviderController {

    private final AtsAiProviderService aiProviderService;

    @PostMapping
    public ResponseEntity<AtsAiProviderResponse> create(@Valid @RequestBody AtsAiProviderRequest request) {
        return new ResponseEntity<>(aiProviderService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsAiProviderResponse>> getAll() {
        return ResponseEntity.ok(aiProviderService.getAll());
    }

    @GetMapping("/page")
    public ResponseEntity<Page<AtsAiProviderResponse>> getPage(Pageable pageable) {
        return ResponseEntity.ok(aiProviderService.getPage(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsAiProviderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(aiProviderService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsAiProviderResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AtsAiProviderRequest request) {
        return ResponseEntity.ok(aiProviderService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        aiProviderService.delete(id);
    }

    @PatchMapping("/{id}/set-active")
    public ResponseEntity<AtsAiProviderResponse> setActive(@PathVariable Long id) {
        return ResponseEntity.ok(aiProviderService.setActive(id));
    }
}
