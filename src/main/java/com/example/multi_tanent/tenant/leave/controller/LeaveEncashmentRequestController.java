package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.leave.dto.LeaveEncashmentProcessRequest;
import com.example.multi_tanent.tenant.leave.dto.LeaveEncashmentRequestDto;
import com.example.multi_tanent.tenant.leave.entity.LeaveEncashmentRequest;
import com.example.multi_tanent.tenant.leave.service.LeaveEncashmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/leave-encashment-requests")
@CrossOrigin(origins = "*")
public class LeaveEncashmentRequestController {

    private final LeaveEncashmentService encashmentService;

    public LeaveEncashmentRequestController(LeaveEncashmentService encashmentService) {
        this.encashmentService = encashmentService;
    }

    @PostMapping
    public ResponseEntity<LeaveEncashmentRequest> createRequest(@RequestBody LeaveEncashmentRequestDto request) {
        LeaveEncashmentRequest createdRequest = encashmentService.createRequest(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdRequest.getId()).toUri();
        return ResponseEntity.created(location).body(createdRequest);
    }

    @GetMapping("/employee/{employeeCode}")
    public ResponseEntity<List<LeaveEncashmentRequest>> getRequestsForEmployee(@PathVariable String employeeCode) {
        return ResponseEntity.ok(encashmentService.getRequestsByEmployeeCode(employeeCode));
    }

    @PutMapping("/process")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<LeaveEncashmentRequest> processRequest(@RequestBody LeaveEncashmentProcessRequest request) {
        return ResponseEntity.ok(encashmentService.processRequest(request));
    }
}
