package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.dto.MissingAttendanceApprovalDto;
import com.example.multi_tanent.tenant.attendance.dto.MissingAttendanceRequestDto;
import com.example.multi_tanent.tenant.attendance.entity.MissingAttendanceRequest;
import com.example.multi_tanent.tenant.attendance.service.MissingAttendanceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;
import java.nio.file.Files;

@RestController
@RequestMapping("/api/missing-attendance")
@CrossOrigin(origins = "*")
public class MissingAttendanceController {

    private final MissingAttendanceService missingAttendanceService;

    public MissingAttendanceController(MissingAttendanceService missingAttendanceService) {
        this.missingAttendanceService = missingAttendanceService;
    }

    @PostMapping(value = "/request/{employeeCode}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    @PreAuthorize("isAuthenticated()") // An employee can request for themselves
    public ResponseEntity<MissingAttendanceRequest> createRequest(
            @PathVariable String employeeCode,
            @Valid @RequestPart("request") MissingAttendanceRequestDto requestDto,
            @RequestPart(value = "file", required = false) MultipartFile file) {
        // TODO: Add security to ensure an employee can only request for themselves, unless they are HR/Admin.
        MissingAttendanceRequest createdRequest = missingAttendanceService.createRequest(employeeCode, requestDto, file);
        return new ResponseEntity<>(createdRequest, HttpStatus.CREATED);
    }

    @GetMapping("/requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<MissingAttendanceRequest>> getAllRequests() {
        // It's better to return a DTO to avoid LazyInitializationException and control the response shape.
        // For now, returning the entity as the service method eagerly fetches the employee.
        List<MissingAttendanceRequest> requests = missingAttendanceService.getAllRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/{requestId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<MissingAttendanceRequest> getRequestById(@PathVariable Long requestId) {
        // TODO: Add security to ensure only the owner or an admin/manager can view the request.
        return missingAttendanceService.getRequestById(requestId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/requests/{requestId}/approval")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'HR', 'MANAGER')")
    public ResponseEntity<MissingAttendanceRequest> approveOrRejectRequest(
            @PathVariable Long requestId,
            @Valid @RequestBody MissingAttendanceApprovalDto approvalDto) {
        MissingAttendanceRequest updatedRequest = missingAttendanceService.approveOrRejectRequest(requestId, approvalDto);
        return ResponseEntity.ok(updatedRequest);
    }

    @GetMapping("/requests/{requestId}/attachment")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> viewAttachment(@PathVariable Long requestId) {
        Resource resource = missingAttendanceService.loadAttachmentFile(requestId);

        String contentType = "application/octet-stream";
        try {
            // Using resource.getFile() can fail if the file is inside a JAR.
            // A more robust way is to check the filename extension if getFile() fails.
            if (resource.exists() || resource.isReadable()) {
                contentType = Files.probeContentType(resource.getFile().toPath());
            }
        } catch (IOException ex) {
            // Log error
            System.err.println("Could not determine content type for file: " + resource.getFilename());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }
}