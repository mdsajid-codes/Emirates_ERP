package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsClientAccountRequest;
import com.example.multi_tanent.ats.dto.AtsClientAccountResponse;
import com.example.multi_tanent.ats.services.AtsClientAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/client-accounts")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsClientAccountController {

    private final AtsClientAccountService accountService;

    @PostMapping
    public ResponseEntity<AtsClientAccountResponse> create(@Valid @RequestBody AtsClientAccountRequest request) {
        return new ResponseEntity<>(accountService.create(request), HttpStatus.CREATED);
    }

    @GetMapping("/client/{clientId}")
    public ResponseEntity<List<AtsClientAccountResponse>> getByClientId(@PathVariable Long clientId) {
        return ResponseEntity.ok(accountService.getByClientId(clientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AtsClientAccountResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AtsClientAccountResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody AtsClientAccountRequest request) {
        return ResponseEntity.ok(accountService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        accountService.delete(id);
    }
}
