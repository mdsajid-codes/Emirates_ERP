package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.PurRequisitionRequest;
import com.example.multi_tanent.purchases.dto.PurRequisitionResponse;
import com.example.multi_tanent.purchases.service.PurRequisitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchases/requisitions")
@RequiredArgsConstructor
public class PurRequisitionController {

    private final PurRequisitionService requisitionService;

    @PostMapping
    public ResponseEntity<PurRequisitionResponse> create(@RequestBody PurRequisitionRequest req) {
        return new ResponseEntity<>(requisitionService.create(req), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<Page<PurRequisitionResponse>> list(Pageable pageable) {
        return ResponseEntity.ok(requisitionService.list(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PurRequisitionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(requisitionService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PurRequisitionResponse> update(@PathVariable Long id,
            @RequestBody PurRequisitionRequest req) {
        return ResponseEntity.ok(requisitionService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        requisitionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<PurRequisitionResponse> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(requisitionService.updateStatus(id, status));
    }
}
