package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsClientNoteRequest;
import com.example.multi_tanent.ats.dto.AtsClientNoteResponse;
import com.example.multi_tanent.ats.services.AtsClientNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/client-notes")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsClientNoteController {

    private final AtsClientNoteService noteService;

    @PostMapping
    public ResponseEntity<AtsClientNoteResponse> create(@Valid @RequestBody AtsClientNoteRequest request) {
        return new ResponseEntity<>(noteService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<AtsClientNoteResponse>> getByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(noteService.getByClientId(clientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsClientNoteResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(noteService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsClientNoteResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AtsClientNoteRequest request) {
        return ResponseEntity.ok(noteService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        noteService.delete(id);
    }
}
