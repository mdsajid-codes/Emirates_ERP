package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProWorkStationDto;
import com.example.multi_tanent.production.dto.ProWorkStationRequest;
import com.example.multi_tanent.production.services.ProWorkStationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/work-stations")
@CrossOrigin(origins = "*")
@PreAuthorize("isAuthenticated()")
public class ProWorkStationController {

    private final ProWorkStationService workStationService;

    public ProWorkStationController(ProWorkStationService workStationService) {
        this.workStationService = workStationService;
    }

    @PostMapping
    public ResponseEntity<ProWorkStationDto> createWorkStation(@Valid @RequestBody ProWorkStationRequest request) {
        ProWorkStationDto created = workStationService.createWorkStation(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ProWorkStationDto> getAllWorkStations() {
        return workStationService.getAllWorkStations();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProWorkStationDto> getWorkStationById(@PathVariable Long id) {
        ProWorkStationDto dto = workStationService.getWorkStationById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProWorkStationDto> updateWorkStation(@PathVariable Long id,
            @Valid @RequestBody ProWorkStationRequest request) {
        ProWorkStationDto updated = workStationService.updateWorkStation(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkStation(@PathVariable Long id) {
        workStationService.deleteWorkStation(id);
        return ResponseEntity.noContent().build();
    }
}
