package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.annotation.RequiresHangerModule;
import com.example.multi_tanent.hanger.dto.HangerTypeRequest;
import com.example.multi_tanent.hanger.dto.HangerTypeResponse;
import com.example.multi_tanent.hanger.enums.HangerTypeEnum;
import com.example.multi_tanent.hanger.service.HangerTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hanger/types")
@RequiredArgsConstructor
@RequiresHangerModule // ALL endpoints in this controller protected by module guard
public class HangerTypeController {

    private final HangerTypeService hangerTypeService;

    /** GET all active hanger types for current tenant */
    @GetMapping
    public ResponseEntity<List<HangerTypeResponse>> getAll() {
        return ResponseEntity.ok(hangerTypeService.getAllActive());
    }

    /** GET a single hanger type by ID */
    @GetMapping("/{id}")
    public ResponseEntity<HangerTypeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hangerTypeService.getById(id));
    }

    /** GET a hanger type by type name (e.g., ADULT) */
    @GetMapping("/by-type/{typeName}")
    public ResponseEntity<HangerTypeResponse> getByTypeName(@PathVariable HangerTypeEnum typeName) {
        return ResponseEntity.ok(hangerTypeService.getByTypeName(typeName));
    }

    /** POST create a new hanger type */
    @PostMapping
    public ResponseEntity<HangerTypeResponse> create(@Valid @RequestBody HangerTypeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(hangerTypeService.create(request));
    }

    /** PUT update an existing hanger type */
    @PutMapping("/{id}")
    public ResponseEntity<HangerTypeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody HangerTypeRequest request) {
        return ResponseEntity.ok(hangerTypeService.update(id, request));
    }

    /** DELETE soft-delete (deactivate) a hanger type */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        hangerTypeService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}
