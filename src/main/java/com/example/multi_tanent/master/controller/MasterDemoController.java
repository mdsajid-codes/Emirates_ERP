package com.example.multi_tanent.master.controller;

import com.example.multi_tanent.master.entity.DemoRequest;
import com.example.multi_tanent.master.entity.DemoRequestStatus;
import com.example.multi_tanent.master.repository.DemoRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Master Admin endpoint for managing demo requests.
 * Requires MASTER_ADMIN role (JWT protected — @EnableMethodSecurity is already active in SecurityConfig).
 */
@Slf4j
@RestController
@RequestMapping("/api/master/demo-requests")
@RequiredArgsConstructor
public class MasterDemoController {

    private final DemoRequestRepository demoRequestRepository;

    /** Return all demo requests sorted newest first. */
    @GetMapping
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<List<DemoRequest>> getAllDemoRequests() {
        return ResponseEntity.ok(demoRequestRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * Update the status of a demo request.
     * @param id      Demo request ID
     * @param status  New status: PENDING | APPROVED | REJECTED | DEMO_SENT
     * @param notes   Optional review notes from the admin
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam DemoRequestStatus status,
            @RequestParam(required = false) String notes) {

        return demoRequestRepository.findById(id)
                .map(req -> {
                    req.setStatus(status);
                    req.setReviewedAt(LocalDateTime.now());
                    if (notes != null && !notes.isBlank()) {
                        req.setReviewNotes(notes);
                    }
                    demoRequestRepository.save(req);
                    log.info("Demo request {} status updated to {} by master admin", id, status);
                    return ResponseEntity.ok(Map.of("success", true, "status", status));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /** Permanently delete a demo request. */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MASTER_ADMIN')")
    public ResponseEntity<?> deleteDemoRequest(@PathVariable Long id) {
        if (!demoRequestRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        demoRequestRepository.deleteById(id);
        log.info("Demo request {} deleted by master admin", id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
