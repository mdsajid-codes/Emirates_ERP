package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.BinRequest;
import com.example.multi_tanent.warehouse.dto.BinResponse;
import com.example.multi_tanent.warehouse.dto.PaginatedResponse;
import com.example.multi_tanent.warehouse.enums.BinType;
import com.example.multi_tanent.warehouse.service.BinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/bins")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BinController {

    private final BinService binService;

    @GetMapping
    public ResponseEntity<List<BinResponse>> list() {
        return ResponseEntity.ok(binService.listAll());
    }

    @GetMapping("/paginated")
    public ResponseEntity<PaginatedResponse<BinResponse>> listPaginated(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(binService.listPaginated(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BinResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(binService.getById(id));
    }

    @GetMapping("/active")
    public ResponseEntity<List<BinResponse>> getActiveBins(@RequestParam(defaultValue = "true") Boolean isActive) {
        return ResponseEntity.ok(binService.fetchByActive(isActive));
    }

    @GetMapping("/type/{binType}")
    public ResponseEntity<List<BinResponse>> getBinsByType(@PathVariable BinType binType) {
        return ResponseEntity.ok(binService.fetchByBinType(binType));
    }

    @GetMapping("/barcode/{barcodeTag}")
    public ResponseEntity<BinResponse> getByBarcodeTag(@PathVariable String barcodeTag) {
        return ResponseEntity.ok(binService.fetchByBarcodeTag(barcodeTag));
    }

    @PostMapping
    public ResponseEntity<BinResponse> create(@Valid @RequestBody BinRequest request) {
        return ResponseEntity.ok(binService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BinResponse> update(@PathVariable Long id, @Valid @RequestBody BinRequest request) {
        return ResponseEntity.ok(binService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        binService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
