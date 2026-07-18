package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsStateRequest;
import com.example.multi_tanent.ats.dto.AtsStateResponse;
import com.example.multi_tanent.ats.services.AtsStateService;
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
@RequestMapping("/api/ats/states")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsStateController {

    private final AtsStateService stateService;

    @PostMapping
    public ResponseEntity<AtsStateResponse> create(@Valid @RequestBody AtsStateRequest request) {
        return new ResponseEntity<>(stateService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public Page<AtsStateResponse> list(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return stateService.getAll(pageable);
    }

    @GetMapping("/list")
    public ResponseEntity<List<AtsStateResponse>> listAll() {
        return ResponseEntity.ok(stateService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsStateResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(stateService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsStateResponse> update(@PathVariable Long id, @Valid @RequestBody AtsStateRequest request) {
        return ResponseEntity.ok(stateService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        stateService.delete(id);
    }
}
