package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsClientContactRequest;
import com.example.multi_tanent.ats.dto.AtsClientContactResponse;
import com.example.multi_tanent.ats.services.AtsClientContactService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/clients/{clientId}/contacts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsClientContactController {

    private final AtsClientContactService contactService;

    @PostMapping
    public ResponseEntity<AtsClientContactResponse> create(
            @PathVariable Long clientId,
            @Valid @RequestBody AtsClientContactRequest request) {
        return new ResponseEntity<>(contactService.create(clientId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsClientContactResponse>> getAll(@PathVariable Long clientId) {
        return ResponseEntity.ok(contactService.getAll(clientId));
    }

    @GetMapping("/{contactId}")
    public ResponseEntity<AtsClientContactResponse> getById(
            @PathVariable Long clientId,
            @PathVariable Long contactId) {
        return ResponseEntity.ok(contactService.getById(clientId, contactId));
    }

    @PutMapping("/{contactId}")
    public ResponseEntity<AtsClientContactResponse> update(
            @PathVariable Long clientId,
            @PathVariable Long contactId,
            @Valid @RequestBody AtsClientContactRequest request) {
        return ResponseEntity.ok(contactService.update(clientId, contactId, request));
    }

    @DeleteMapping("/{contactId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long clientId,
            @PathVariable Long contactId) {
        contactService.delete(clientId, contactId);
    }
}
