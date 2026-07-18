package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.CrmCallLogDto;
import com.example.multi_tanent.crm.dto.CrmCallLogRequestDto;
import com.example.multi_tanent.crm.services.CrmCallLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm/call-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CrmCallLogController {

    private final CrmCallLogService callLogService;

    @GetMapping
    @PreAuthorize("@crmAccess.canView('CALL_LOG')")
    public ResponseEntity<Page<CrmCallLogDto>> getAll(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(callLogService.getAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@crmAccess.canView('CALL_LOG')")
    public ResponseEntity<CrmCallLogDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(callLogService.getById(id));
    }

    @GetMapping("/by-lead/{leadId}")
    @PreAuthorize("@crmAccess.canView('CALL_LOG')")
    public ResponseEntity<List<CrmCallLogDto>> getByLeadId(@PathVariable Long leadId) {
        return ResponseEntity.ok(callLogService.getByLeadId(leadId));
    }

    @PostMapping
    @PreAuthorize("@crmAccess.canCreate('CALL_LOG')")
    public ResponseEntity<CrmCallLogDto> create(@Valid @RequestBody CrmCallLogRequestDto request) {
        CrmCallLogDto createdLog = callLogService.create(request);
        return new ResponseEntity<>(createdLog, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@crmAccess.canUpdate('CALL_LOG')")
    public ResponseEntity<CrmCallLogDto> update(@PathVariable Long id, @Valid @RequestBody CrmCallLogRequestDto request) {
        return ResponseEntity.ok(callLogService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@crmAccess.canDelete('CALL_LOG')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        callLogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
