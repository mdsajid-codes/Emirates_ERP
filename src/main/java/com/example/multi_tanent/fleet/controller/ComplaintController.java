package com.example.multi_tanent.fleet.controller;

import com.example.multi_tanent.fleet.dtos.ComplaintRequest;
import com.example.multi_tanent.fleet.dtos.ComplaintResponse;
import com.example.multi_tanent.fleet.enums.ComplaintStatus;
import com.example.multi_tanent.fleet.enums.RiskLevel;
import com.example.multi_tanent.fleet.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/fleet/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ResponseEntity<ComplaintResponse> createComplaint(@RequestBody ComplaintRequest request) {
        return ResponseEntity.ok(complaintService.createComplaint(request));
    }

    @GetMapping
    public ResponseEntity<Page<ComplaintResponse>> listAll(
            @RequestParam(required = false) ComplaintStatus status,
            @RequestParam(required = false) RiskLevel riskLevel,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(complaintService.listAll(status, riskLevel, search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ComplaintResponse> getComplaint(@PathVariable Long id) {
        return ResponseEntity.ok(complaintService.getComplaint(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ComplaintResponse> updateComplaint(@PathVariable Long id, @RequestBody ComplaintRequest request) {
        return ResponseEntity.ok(complaintService.updateComplaint(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComplaint(@PathVariable Long id) {
        complaintService.deleteComplaint(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/attachment")
    public ResponseEntity<ComplaintResponse> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(complaintService.uploadAttachment(id, file));
    }
}
