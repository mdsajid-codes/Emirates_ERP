package com.example.multi_tanent.accounts.controller.coa;

import com.example.multi_tanent.accounts.dto.journal.JournalEntryRequest;
import com.example.multi_tanent.accounts.dto.journal.JournalEntryResponse;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.entity.enums.JournalEntryStatus;
import com.example.multi_tanent.accounts.service.journal.JournalEntryService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/accounts/journal")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'ACCOUNTANT', 'SUPER_ADMIN')")
public class JournalEntryController {

    private final JournalEntryService journalEntryService;

    private Map<String, Object> buildResponse(boolean success, String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDraft(@RequestBody JournalEntryRequest request, Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        JournalEntryResponse data = journalEntryService.createDraft(request, username);
        return ResponseEntity.ok(buildResponse(true, "Journal entry draft created successfully", data));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateDraft(@PathVariable Long id, @RequestBody JournalEntryRequest request, Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        JournalEntryResponse data = journalEntryService.updateDraft(id, request, username);
        return ResponseEntity.ok(buildResponse(true, "Journal entry draft updated successfully", data));
    }

    @PostMapping("/{id}/post")
    public ResponseEntity<Map<String, Object>> post(@PathVariable Long id, Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        JournalEntryResponse data = journalEntryService.post(id, username);
        return ResponseEntity.ok(buildResponse(true, "Journal entry posted successfully", data));
    }

    @PostMapping("/{id}/reverse")
    public ResponseEntity<Map<String, Object>> reverse(@PathVariable Long id, Principal principal) {
        String username = principal != null ? principal.getName() : "system";
        JournalEntryResponse data = journalEntryService.reverse(id, username);
        return ResponseEntity.ok(buildResponse(true, "Journal entry reversed successfully", data));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {
        JournalEntryResponse data = journalEntryService.getById(id);
        return ResponseEntity.ok(buildResponse(true, "Journal entry retrieved successfully", data));
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAll(
            @RequestParam(required = false) JournalEntryStatus status,
            @RequestParam(required = false) DocumentType documentType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {
        List<JournalEntryResponse> data = journalEntryService.getAll(status, documentType, dateFrom, dateTo);
        return ResponseEntity.ok(buildResponse(true, "Journal entries retrieved successfully", data));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteDraft(@PathVariable Long id) {
        journalEntryService.delete(id);
        return ResponseEntity.ok(buildResponse(true, "Journal entry draft deleted successfully", null));
    }
}
