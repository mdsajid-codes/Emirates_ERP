package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsDocumentTypeRequest;
import com.example.multi_tanent.ats.dto.AtsDocumentTypeResponse;
import com.example.multi_tanent.ats.services.AtsDocumentTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/document-types")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsDocumentTypeController {

    private final AtsDocumentTypeService documentTypeService;

    @PostMapping
    public ResponseEntity<AtsDocumentTypeResponse> create(@Valid @RequestBody AtsDocumentTypeRequest request) {
        return new ResponseEntity<>(documentTypeService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public Page<AtsDocumentTypeResponse> list(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return documentTypeService.getAll(pageable);
    }

    @GetMapping("/list")
    public ResponseEntity<List<AtsDocumentTypeResponse>> listAll() {
        return ResponseEntity.ok(documentTypeService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsDocumentTypeResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(documentTypeService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsDocumentTypeResponse> update(@PathVariable Long id, @Valid @RequestBody AtsDocumentTypeRequest request) {
        return ResponseEntity.ok(documentTypeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        documentTypeService.delete(id);
    }
}
