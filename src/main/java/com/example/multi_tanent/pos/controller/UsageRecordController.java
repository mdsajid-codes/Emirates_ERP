package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.entity.UsageRecord;
import com.example.multi_tanent.pos.service.UsageRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pos/usage-records")
@CrossOrigin(origins = "*")
public class UsageRecordController {

    private final UsageRecordService usageRecordService;

    public UsageRecordController(UsageRecordService usageRecordService) {
        this.usageRecordService = usageRecordService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<List<UsageRecord>> getAllUsageRecords() {
        return ResponseEntity.ok(usageRecordService.getAllUsageRecordsForCurrentTenant());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN', 'POS_MANAGER')")
    public ResponseEntity<UsageRecord> getUsageRecordById(@PathVariable Long id) {
        return usageRecordService.getUsageRecordById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
