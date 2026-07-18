package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.TransferOrderItemRequest;
import com.example.multi_tanent.warehouse.dto.TransferOrderRequest;
import com.example.multi_tanent.warehouse.dto.TransferOrderResponse;
import com.example.multi_tanent.warehouse.enums.TransferStatus;
import com.example.multi_tanent.warehouse.service.TransferOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/warehouse/transfers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TransferOrderController {

    private final TransferOrderService service;

    private Long getCurrentUserId() {
        // Normally this would come from Spring Security principal.
        // For now, defaulting to 1L or fetching a standard value.
        return 1L; 
    }

    @PostMapping
    public ResponseEntity<TransferOrderResponse> create(@Valid @RequestBody TransferOrderRequest req) {
        Long userId = getCurrentUserId();
        TransferOrderResponse resp = service.create(req, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<TransferOrderResponse> approve(@PathVariable Long id) {
        Long userId = getCurrentUserId();
        TransferOrderResponse resp = service.approve(id, userId);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}/dispatch")
    public ResponseEntity<TransferOrderResponse> dispatch(
            @PathVariable Long id, 
            @Valid @RequestBody List<TransferOrderItemRequest> dispatchItems) {
        Long userId = getCurrentUserId();
        TransferOrderResponse resp = service.dispatch(id, dispatchItems, userId);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}/receive")
    public ResponseEntity<TransferOrderResponse> receive(
            @PathVariable Long id, 
            @Valid @RequestBody List<TransferOrderItemRequest> receiveItems) {
        Long userId = getCurrentUserId();
        TransferOrderResponse resp = service.receive(id, receiveItems, userId);
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<TransferOrderResponse> cancel(@PathVariable Long id) {
        TransferOrderResponse resp = service.cancel(id);
        return ResponseEntity.ok(resp);
    }

    @GetMapping
    public ResponseEntity<Page<TransferOrderResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Sort s = Sort.by(Sort.Direction.DESC, "createdAt");
        try {
            String[] sp = sort.split(",");
            if (sp.length == 2) {
                s = Sort.by(Sort.Direction.fromString(sp[1]), sp[0]);
            }
        } catch (Exception ignored) {}
        
        Pageable p = PageRequest.of(page, size, s);
        return ResponseEntity.ok(service.list(p));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<TransferOrderResponse>> listByStatus(
            @PathVariable TransferStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Sort s = Sort.by(Sort.Direction.DESC, "createdAt");
        try {
            String[] sp = sort.split(",");
            if (sp.length == 2) {
                s = Sort.by(Sort.Direction.fromString(sp[1]), sp[0]);
            }
        } catch (Exception ignored) {}
        
        Pageable p = PageRequest.of(page, size, s);
        return ResponseEntity.ok(service.listByStatus(status, p));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransferOrderResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }
}
