package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.entity.AuditEvent;
import com.example.multi_tanent.pos.service.AuditEventService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos/audit-events")
@CrossOrigin(origins = "*")
public class AuditEventController {

    private final AuditEventService auditEventService;

    public AuditEventController(AuditEventService auditEventService) {
        this.auditEventService = auditEventService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<List<AuditEvent>> getAllAuditEvents() {
        return ResponseEntity.ok(auditEventService.getAllAuditEventsForCurrentTenant());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<AuditEvent> getAuditEventById(@PathVariable Long id) {
        return auditEventService.getAuditEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
