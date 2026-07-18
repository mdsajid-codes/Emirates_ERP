package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsClientTaskRequest;
import com.example.multi_tanent.ats.dto.AtsClientTaskResponse;
import com.example.multi_tanent.ats.services.AtsClientTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/clients/{clientId}/tasks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsClientTaskController {

    private final AtsClientTaskService taskService;

    @PostMapping
    public ResponseEntity<AtsClientTaskResponse> create(
            @PathVariable Long clientId,
            @Valid @RequestBody AtsClientTaskRequest request) {
        return new ResponseEntity<>(taskService.create(clientId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsClientTaskResponse>> getAll(@PathVariable Long clientId) {
        return ResponseEntity.ok(taskService.getAll(clientId));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<AtsClientTaskResponse> getById(
            @PathVariable Long clientId,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getById(clientId, taskId));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<AtsClientTaskResponse> update(
            @PathVariable Long clientId,
            @PathVariable Long taskId,
            @Valid @RequestBody AtsClientTaskRequest request) {
        return ResponseEntity.ok(taskService.update(clientId, taskId, request));
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long clientId,
            @PathVariable Long taskId) {
        taskService.delete(clientId, taskId);
    }

    @PatchMapping("/{taskId}/complete")
    public ResponseEntity<AtsClientTaskResponse> complete(
            @PathVariable Long clientId,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.complete(clientId, taskId));
    }
}
