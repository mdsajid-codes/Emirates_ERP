package com.example.multi_tanent.ats.controller;

import com.example.multi_tanent.ats.dto.AtsVendorTaskRequest;
import com.example.multi_tanent.ats.dto.AtsVendorTaskResponse;
import com.example.multi_tanent.ats.services.AtsVendorTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ats/vendors/{vendorId}/tasks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AtsVendorTaskController {

    private final AtsVendorTaskService taskService;

    @PostMapping
    public ResponseEntity<AtsVendorTaskResponse> create(
            @PathVariable Long vendorId,
            @Valid @RequestBody AtsVendorTaskRequest request) {
        return new ResponseEntity<>(taskService.create(vendorId, request), HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<AtsVendorTaskResponse>> getAll(@PathVariable Long vendorId) {
        return ResponseEntity.ok(taskService.getAll(vendorId));
    }

    @GetMapping("/{taskId}")
    public ResponseEntity<AtsVendorTaskResponse> getById(
            @PathVariable Long vendorId,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.getById(vendorId, taskId));
    }

    @PutMapping("/{taskId}")
    public ResponseEntity<AtsVendorTaskResponse> update(
            @PathVariable Long vendorId,
            @PathVariable Long taskId,
            @Valid @RequestBody AtsVendorTaskRequest request) {
        return ResponseEntity.ok(taskService.update(vendorId, taskId, request));
    }

    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long vendorId,
            @PathVariable Long taskId) {
        taskService.delete(vendorId, taskId);
    }

    @PatchMapping("/{taskId}/complete")
    public ResponseEntity<AtsVendorTaskResponse> complete(
            @PathVariable Long vendorId,
            @PathVariable Long taskId) {
        return ResponseEntity.ok(taskService.complete(vendorId, taskId));
    }
}
