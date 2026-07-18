package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.leave.dto.LeavePolicyRequest;
import com.example.multi_tanent.tenant.leave.dto.LeaveTypePolicyRequest;
import com.example.multi_tanent.tenant.leave.entity.LeavePolicy;
import com.example.multi_tanent.tenant.leave.entity.LeaveTypePolicy;
import com.example.multi_tanent.tenant.leave.service.LeavePolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/leave-policies")
@CrossOrigin(origins = "*")
public class LeavePolicyController {

    private final LeavePolicyService leavePolicyService;

    public LeavePolicyController(LeavePolicyService leavePolicyService) {
        this.leavePolicyService = leavePolicyService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public List<LeavePolicy> getAllLeavePolicies() {
        return leavePolicyService.getAllLeavePolicies();
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<LeavePolicy> createLeavePolicy(@Valid @RequestBody LeavePolicyRequest request) {
        LeavePolicy createdPolicy = leavePolicyService.createLeavePolicy(request);
        return ResponseEntity.created(URI.create("/api/leave-policies/" + createdPolicy.getId())).body(createdPolicy);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<LeavePolicy> updateLeavePolicy(@PathVariable Long id, @Valid @RequestBody LeavePolicyRequest request) {
        LeavePolicy updatedPolicy = leavePolicyService.updateLeavePolicy(id, request);
        return ResponseEntity.ok(updatedPolicy);
    }

    @PostMapping("/{policyId}/leave-types")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<LeaveTypePolicy> addLeaveTypeToPolicy(@PathVariable Long policyId, @Valid @RequestBody LeaveTypePolicyRequest request) {
        LeaveTypePolicy newLeaveTypePolicy = leavePolicyService.addLeaveTypePolicyToPolicy(policyId, request);
        return ResponseEntity.created(URI.create("/api/leave-type-policies/" + newLeaveTypePolicy.getId())).body(newLeaveTypePolicy);
    }

    @PutMapping("/leave-types/{leaveTypePolicyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<LeaveTypePolicy> updateLeaveTypePolicy(@PathVariable Long leaveTypePolicyId, @Valid @RequestBody LeaveTypePolicyRequest request) {
        LeaveTypePolicy updated = leavePolicyService.updateLeaveTypePolicy(leaveTypePolicyId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/leave-types/{leaveTypePolicyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<Void> deleteLeaveTypePolicy(@PathVariable Long leaveTypePolicyId) {
        leavePolicyService.deleteLeaveTypePolicy(leaveTypePolicyId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<Void> deleteLeavePolicy(@PathVariable Long id) {
        leavePolicyService.deleteLeavePolicy(id);
        return ResponseEntity.noContent().build();
    }
}