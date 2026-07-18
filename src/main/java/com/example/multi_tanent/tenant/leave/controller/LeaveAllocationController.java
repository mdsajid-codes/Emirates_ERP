package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.leave.dto.LeaveAllocationRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveAllocation;
import com.example.multi_tanent.tenant.leave.service.LeaveAllocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/leave-allocations")
@CrossOrigin(origins = "*")
public class LeaveAllocationController {

    private final LeaveAllocationService allocationService;

    public LeaveAllocationController(LeaveAllocationService allocationService) {
        this.allocationService = allocationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<LeaveAllocation> createAllocation(@RequestBody LeaveAllocationRequest request) {
        LeaveAllocation createdAllocation = allocationService.createAllocation(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdAllocation.getId()).toUri();
        return ResponseEntity.created(location).body(createdAllocation);
    }

    @GetMapping("/employee/{employeeCode}")
    public ResponseEntity<List<LeaveAllocation>> getAllocationsForEmployee(@PathVariable String employeeCode) {
        return ResponseEntity.ok(allocationService.getAllocationsByEmployeeCode(employeeCode));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<LeaveAllocation> updateAllocation(@PathVariable Long id, @RequestBody LeaveAllocationRequest request) {
        LeaveAllocation updatedAllocation = allocationService.updateAllocation(id, request);
        return ResponseEntity.ok(updatedAllocation);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteAllocation(@PathVariable Long id) {
        allocationService.deleteAllocation(id);
        return ResponseEntity.noContent().build();
    }
}
