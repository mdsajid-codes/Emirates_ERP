package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.leave.dto.LeaveApprovalRequest;
import com.example.multi_tanent.tenant.leave.dto.LeaveRequestResponseDto;
import com.example.multi_tanent.tenant.leave.service.LeaveApprovalService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leave-approvals")
@CrossOrigin(origins = "*")
public class LeaveApprovalController {

    private final LeaveApprovalService approvalService;

    public LeaveApprovalController(LeaveApprovalService approvalService) {
        this.approvalService = approvalService;
    }

    @GetMapping("/pending")
    public ResponseEntity<List<LeaveRequestResponseDto>> getPendingApprovals() {
        return ResponseEntity.ok(approvalService.getPendingApprovalsForCurrentUser());
    }

    @PostMapping("/process")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<LeaveRequestResponseDto> processLeaveApproval(@RequestBody LeaveApprovalRequest request) {
        return ResponseEntity.ok(approvalService.processApproval(request));
    }
}
