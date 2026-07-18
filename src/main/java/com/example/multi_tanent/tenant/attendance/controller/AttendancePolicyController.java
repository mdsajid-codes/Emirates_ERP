package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.dto.AttendancePolicyRequest;
import com.example.multi_tanent.tenant.attendance.dto.AttendancePolicyResponse;
import com.example.multi_tanent.tenant.attendance.service.AttendancePolicyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/attendance-policies")
@CrossOrigin(origins = "*")
public class AttendancePolicyController {

    private final AttendancePolicyService attendancePolicyService;

    public AttendancePolicyController(AttendancePolicyService attendancePolicyService) {
        this.attendancePolicyService = attendancePolicyService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<AttendancePolicyResponse> createPolicy(@Valid @RequestBody AttendancePolicyRequest request) {
        AttendancePolicyResponse createdPolicy = attendancePolicyService.createPolicy(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(createdPolicy.getId()).toUri();
        return ResponseEntity.created(location).body(createdPolicy);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttendancePolicyResponse>> getAllPolicies() {
        return ResponseEntity.ok(attendancePolicyService.getAllPolicies());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AttendancePolicyResponse> getPolicyById(@PathVariable Long id) {
        return attendancePolicyService.getPolicyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<AttendancePolicyResponse> updatePolicy(@PathVariable Long id, @Valid @RequestBody AttendancePolicyRequest request) {
        AttendancePolicyResponse updatedPolicy = attendancePolicyService.updatePolicy(id, request);
        return ResponseEntity.ok(updatedPolicy);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        attendancePolicyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }
}
