package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.leave.dto.LeaveTypePolicyRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveTypePolicy;
import com.example.multi_tanent.tenant.leave.service.LeavePolicyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-type-policies")
@CrossOrigin(origins = "*")
public class LeaveTypePolicyController {

    private final LeavePolicyService leavePolicyService;

    public LeaveTypePolicyController(LeavePolicyService leavePolicyService) {
        this.leavePolicyService = leavePolicyService;
    }

    // /**
    //  * Adds a new LeaveTypePolicy to an existing LeavePolicy.
    //  * @param policyId The ID of the parent LeavePolicy.
    //  * @param request The details of the new LeaveTypePolicy.
    //  * @return The created LeaveTypePolicy.
    //  */
    // @PostMapping("/policy/{policyId}")
    // @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    // public ResponseEntity<LeaveTypePolicy> addLeaveTypePolicyToPolicy(@PathVariable Long policyId, @Valid @RequestBody LeaveTypePolicyRequest request) {
    //     LeaveTypePolicy created = leavePolicyService.addLeaveTypePolicyToPolicy(policyId, request);
    //     // Note: The location URI might need adjustment depending on how you want to retrieve a single LeaveTypePolicy.
    //     // For now, we return the created object without a location header.
    //     return ResponseEntity.ok(created);
    // }

    @GetMapping
    public ResponseEntity<List<LeaveTypePolicy>> getAllLeaveTypePolicies() {
        return ResponseEntity.ok(leavePolicyService.getAllLeaveTypePolicies());
    }

    @PutMapping("/{leaveTypePolicyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<LeaveTypePolicy> updateLeaveTypePolicy(@PathVariable Long leaveTypePolicyId, @Valid @RequestBody LeaveTypePolicyRequest request) {
        LeaveTypePolicy updated = leavePolicyService.updateLeaveTypePolicy(leaveTypePolicyId, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{leaveTypePolicyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<Void> deleteLeaveTypePolicy(@PathVariable Long leaveTypePolicyId) {
        leavePolicyService.deleteLeaveTypePolicy(leaveTypePolicyId);
        return ResponseEntity.noContent().build();
    }
}
