package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.leave.dto.LeaveRequestDto;
import com.example.multi_tanent.tenant.leave.dto.LeaveRequestResponseDto;
import com.example.multi_tanent.tenant.leave.service.LeaveRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/leave-requests")
@CrossOrigin(origins = "*")
public class LeaveRequestController {

    private final LeaveRequestService leaveRequestService;

    public LeaveRequestController(LeaveRequestService leaveRequestService) {
        this.leaveRequestService = leaveRequestService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveRequestResponseDto> createLeaveRequest(@RequestBody LeaveRequestDto requestDto) {
        LeaveRequestResponseDto createdRequest = leaveRequestService.createLeaveRequest(requestDto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdRequest.getId()).toUri();
        return ResponseEntity.created(location).body(createdRequest);
    }

    @GetMapping("/employee/{employeeCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaveRequestResponseDto>> getLeaveRequestsForEmployee(@PathVariable String employeeCode) {
        return ResponseEntity.ok(leaveRequestService.getLeaveRequestsByEmployeeCode(employeeCode));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<List<LeaveRequestResponseDto>> getAllLeaveRequests() {
        return ResponseEntity.ok(leaveRequestService.getAllLeaveRequests());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveRequestResponseDto> getLeaveRequestById(@PathVariable Long id) {
        return leaveRequestService.getLeaveRequestById(id) 
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveRequestResponseDto> cancelLeaveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(leaveRequestService.cancelLeaveRequest(id));
    }
}
