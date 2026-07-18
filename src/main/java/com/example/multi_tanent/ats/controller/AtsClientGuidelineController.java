package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsClientGuidelineRequest;
import com.example.multi_tanent.ats.dto.AtsClientGuidelineResponse;
import com.example.multi_tanent.ats.services.AtsClientGuidelineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ats/clients/{clientId}/guideline")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsClientGuidelineController {

    private final AtsClientGuidelineService guidelineService;

    @GetMapping
    public ResponseEntity<AtsClientGuidelineResponse> get(@PathVariable Long clientId) {
        return ResponseEntity.ok(guidelineService.get(clientId));
    }

    @PutMapping
    public ResponseEntity<AtsClientGuidelineResponse> upsert(
            @PathVariable Long clientId,
            @Valid @RequestBody AtsClientGuidelineRequest request) {
        return ResponseEntity.ok(guidelineService.upsert(clientId, request));
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long clientId) {
        guidelineService.delete(clientId);
    }
}
