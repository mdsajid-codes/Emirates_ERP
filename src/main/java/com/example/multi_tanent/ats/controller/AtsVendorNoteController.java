package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorNoteRequest;
import com.example.multi_tanent.ats.dto.AtsVendorNoteResponse;
import com.example.multi_tanent.ats.services.AtsVendorNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/vendors/{vendorId}/notes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorNoteController {

    private final AtsVendorNoteService noteService;

    @PostMapping
    public ResponseEntity<AtsVendorNoteResponse> create(
            @PathVariable Long vendorId,
            @Valid @RequestBody AtsVendorNoteRequest request) {
        return new ResponseEntity<>(noteService.create(vendorId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsVendorNoteResponse>> getAll(@PathVariable Long vendorId) {
        return ResponseEntity.ok(noteService.getAll(vendorId));
    }

    @GetMapping("/{noteId}")
    public ResponseEntity<AtsVendorNoteResponse> getById(
            @PathVariable Long vendorId,
            @PathVariable Long noteId) {
        return ResponseEntity.ok(noteService.getById(vendorId, noteId));
    }

    @PutMapping("/{noteId}")
    public ResponseEntity<AtsVendorNoteResponse> update(
            @PathVariable Long vendorId,
            @PathVariable Long noteId,
            @Valid @RequestBody AtsVendorNoteRequest request) {
        return ResponseEntity.ok(noteService.update(vendorId, noteId, request));
    }

    @DeleteMapping("/{noteId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long vendorId,
            @PathVariable Long noteId) {
        noteService.delete(vendorId, noteId);
    }

    @PatchMapping("/{noteId}/pin")
    public ResponseEntity<AtsVendorNoteResponse> togglePin(
            @PathVariable Long vendorId,
            @PathVariable Long noteId) {
        return ResponseEntity.ok(noteService.togglePin(vendorId, noteId));
    }
}
