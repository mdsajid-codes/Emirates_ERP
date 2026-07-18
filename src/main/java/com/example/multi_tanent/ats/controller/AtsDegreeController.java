package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsDegreeRequest;
import com.example.multi_tanent.ats.dto.AtsDegreeResponse;
import com.example.multi_tanent.ats.services.AtsDegreeService;
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
@RequestMapping("/api/ats/degrees")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsDegreeController {

    private final AtsDegreeService degreeService;

    @PostMapping
    public ResponseEntity<AtsDegreeResponse> create(@Valid @RequestBody AtsDegreeRequest request) {
        return new ResponseEntity<>(degreeService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public Page<AtsDegreeResponse> list(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return degreeService.getAll(pageable);
    }

    @GetMapping("/list")
    public ResponseEntity<List<AtsDegreeResponse>> listAll() {
        return ResponseEntity.ok(degreeService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsDegreeResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(degreeService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsDegreeResponse> update(@PathVariable Long id, @Valid @RequestBody AtsDegreeRequest request) {
        return ResponseEntity.ok(degreeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        degreeService.delete(id);
    }
}
