package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.WareProductSerialRequest;
import com.example.multi_tanent.warehouse.dto.WareProductSerialResponse;
import com.example.multi_tanent.warehouse.service.WareProductSerialService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/warehouse/serials")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WareProductSerialController {

    private final WareProductSerialService serialService;

    @PostMapping
    public ResponseEntity<WareProductSerialResponse> create(@Valid @RequestBody WareProductSerialRequest req) {
        return ResponseEntity.ok(serialService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WareProductSerialResponse> update(@PathVariable Long id,
            @Valid @RequestBody WareProductSerialRequest req) {
        return ResponseEntity.ok(serialService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        serialService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{serial}")
    public ResponseEntity<WareProductSerialResponse> getBySerial(@PathVariable String serial) {
        return serialService.findBySerial(serial)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
