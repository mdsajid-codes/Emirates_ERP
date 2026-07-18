package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.DispatchAssignRequest;
import com.example.multi_tanent.fleet.dtos.DispatchJobRequest;
import com.example.multi_tanent.fleet.dtos.DispatchJobResponse;
import com.example.multi_tanent.fleet.enums.DeliveryStatus;
import com.example.multi_tanent.fleet.service.DispatchJobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/fleet/dispatch/jobs")
@RequiredArgsConstructor
public class DispatchJobController {

    private final DispatchJobService dispatchJobService;

    @PostMapping
    public ResponseEntity<DispatchJobResponse> createJob(@RequestBody DispatchJobRequest request) {
        return ResponseEntity.ok(dispatchJobService.createJob(request));
    }

    @GetMapping
    public ResponseEntity<Page<DispatchJobResponse>> listJobs(
            @RequestParam(required = false) DeliveryStatus status,
            @RequestParam(required = false) Long tripId,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(dispatchJobService.listJobs(status, tripId, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DispatchJobResponse> getJob(@PathVariable Long id) {
        return ResponseEntity.ok(dispatchJobService.getJob(id));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<DispatchJobResponse> assignResources(
            @PathVariable Long id,
            @RequestBody DispatchAssignRequest request) {
        return ResponseEntity.ok(dispatchJobService.assignResources(id, request));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<DispatchJobResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam DeliveryStatus status) {
        return ResponseEntity.ok(dispatchJobService.updateStatus(id, status));
    }

    @PostMapping("/{id}/pod")
    public ResponseEntity<DispatchJobResponse> uploadPod(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(dispatchJobService.uploadPod(id, file));
    }

    @GetMapping("/pods/**")
    public ResponseEntity<org.springframework.core.io.Resource> servePodFile(jakarta.servlet.http.HttpServletRequest request) {
        String fullPath = request.getRequestURI();
        String path = fullPath.substring(fullPath.indexOf("/pods/") + 6);
        org.springframework.core.io.Resource resource = dispatchJobService.loadDispatchFileAsResource(path);
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "inline")
                .body(resource);
    }
}
