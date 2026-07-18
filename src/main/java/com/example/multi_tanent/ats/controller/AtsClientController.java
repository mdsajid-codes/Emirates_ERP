package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.*;
import com.example.multi_tanent.ats.services.AtsClientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/clients")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsClientController {

    private final AtsClientService clientService;

    @PostMapping
    public ResponseEntity<AtsClientDetailResponse> create(@Valid @RequestBody AtsClientRequest request) {
        return new ResponseEntity<>(clientService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<AtsClientSummaryResponse>> getPage(@ModelAttribute AtsClientFilterRequest filter) {
        return ResponseEntity.ok(clientService.getPage(filter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsClientDetailResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(clientService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsClientDetailResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AtsClientRequest request) {
        return ResponseEntity.ok(clientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        clientService.delete(id);
    }
}
