package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.dto.AttendanceCapturingPolicyRequest;
import com.example.multi_tanent.tenant.attendance.dto.AttendanceCapturingPolicyResponse;
import com.example.multi_tanent.tenant.attendance.service.AttendanceCapturingPolicyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/attendance-capturing-policies")
@CrossOrigin(origins = "*")
public class AttendanceCapturingPolicyController {

    private final AttendanceCapturingPolicyService policyService;

    public AttendanceCapturingPolicyController(AttendanceCapturingPolicyService policyService) {
        this.policyService = policyService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<AttendanceCapturingPolicyResponse> createPolicy(@Valid @RequestBody AttendanceCapturingPolicyRequest request) {
        AttendanceCapturingPolicyResponse createdPolicy = policyService.createPolicy(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdPolicy.getId()).toUri();
        return ResponseEntity.created(location).body(createdPolicy);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttendanceCapturingPolicyResponse>> getAllPolicies() {
        return ResponseEntity.ok(policyService.getAllPolicies());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AttendanceCapturingPolicyResponse> getPolicyById(@PathVariable Long id) {
        return policyService.getPolicyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<AttendanceCapturingPolicyResponse> updatePolicy(@PathVariable Long id, @Valid @RequestBody AttendanceCapturingPolicyRequest request) {
        return ResponseEntity.ok(policyService.updatePolicy(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<Void> deletePolicy(@PathVariable Long id) {
        policyService.deletePolicy(id);
        return ResponseEntity.noContent().build();
    }
}
