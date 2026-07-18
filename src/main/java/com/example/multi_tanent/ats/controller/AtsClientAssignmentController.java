package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsClientAssignmentRequest;
import com.example.multi_tanent.ats.dto.AtsClientAssignmentResponse;
import com.example.multi_tanent.ats.services.AtsClientAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/clients/{clientId}/assignment")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsClientAssignmentController {

    private final AtsClientAssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<AtsClientAssignmentResponse> get(@PathVariable Long clientId) {
        return ResponseEntity.ok(assignmentService.get(clientId));
    }

    @PutMapping
    public ResponseEntity<AtsClientAssignmentResponse> upsert(
            @PathVariable Long clientId,
            @Valid @RequestBody AtsClientAssignmentRequest request) {
        return ResponseEntity.ok(assignmentService.upsert(clientId, request));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long clientId) {
        assignmentService.delete(clientId);
    }
}
