package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsCountryRequest;
import com.example.multi_tanent.ats.dto.AtsCountryResponse;
import com.example.multi_tanent.ats.services.AtsCountryService;
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
@RequestMapping("/api/ats/countries")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsCountryController {

    private final AtsCountryService countryService;

    @PostMapping
    public ResponseEntity<AtsCountryResponse> create(@Valid @RequestBody AtsCountryRequest request) {
        return new ResponseEntity<>(countryService.create(request), HttpStatus.CREATED);
    }

    @GetMapping
    public Page<AtsCountryResponse> list(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return countryService.getAll(pageable);
    }

    @GetMapping("/list")
    public ResponseEntity<List<AtsCountryResponse>> listAll() {
        return ResponseEntity.ok(countryService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsCountryResponse> get(@PathVariable Long id) {
        return ResponseEntity.ok(countryService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsCountryResponse> update(@PathVariable Long id, @Valid @RequestBody AtsCountryRequest request) {
        return ResponseEntity.ok(countryService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        countryService.delete(id);
    }
}
