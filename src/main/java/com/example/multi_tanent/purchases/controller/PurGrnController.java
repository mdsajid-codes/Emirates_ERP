package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.*;
import com.example.multi_tanent.purchases.service.PurGrnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchases/grns")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurGrnController {

    private final PurGrnService grnService;

    /**
     * Create a new GRN.
     * NOTE: The /{id:\\d+} regex constraint on getById/print is important —
     * without it, Spring treats any string (like "create") as an {id} match,
     * and since only GET is registered for {id}, POST returns 405.
     */
    @PostMapping
    public ResponseEntity<PurGrnResponse> create(@RequestBody PurGrnRequest req) {
        PurGrnResponse resp = grnService.create(req);
        return ResponseEntity.status(201).body(resp);
    }

    @GetMapping("/by-order/{orderId}")
    public ResponseEntity<List<PurGrnResponse>> listByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(grnService.listByOrder(orderId));
    }

    // \\d+ ensures only numeric IDs match — prevents conflicts with named sub-paths
    // like /create
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<PurGrnResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(grnService.getById(id));
    }

    @GetMapping("/{id:\\d+}/print")
    public ResponseEntity<PurGrnResponse> print(@PathVariable Long id) {
        return ResponseEntity.ok(grnService.getById(id));
    }

    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("PurGrnController is alive and registered!");
    }
}
