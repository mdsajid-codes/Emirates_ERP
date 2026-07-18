package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.leave.dto.LeaveTypeRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveType;
import com.example.multi_tanent.tenant.leave.service.LeaveTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/leave-types")
@CrossOrigin(origins = "*")
public class LeaveTypeController {
    private final LeaveTypeService leaveTypeService;

    public LeaveTypeController(LeaveTypeService leaveTypeService) {
        this.leaveTypeService = leaveTypeService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<LeaveType> createLeaveType(@RequestBody LeaveTypeRequest request) {
        LeaveType createdLeaveType = leaveTypeService.createLeaveType(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdLeaveType.getId()).toUri();
        return ResponseEntity.created(location).body(createdLeaveType);
    }

    @GetMapping
    public ResponseEntity<List<LeaveType>> getAllLeaveTypes() {
        return ResponseEntity.ok(leaveTypeService.getActiveLeaveTypes());
    }

    @GetMapping("/all-with-inactive")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR')")
    public ResponseEntity<List<LeaveType>> getAllLeaveTypesWithInactive() {
        return ResponseEntity.ok(leaveTypeService.getAllLeaveTypes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LeaveType> getLeaveTypeById(@PathVariable Long id) {
        return leaveTypeService.getLeaveTypeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<LeaveType> updateLeaveType(@PathVariable Long id, @RequestBody LeaveTypeRequest request) {
        LeaveType updatedLeaveType = leaveTypeService.updateLeaveType(id, request);
        return ResponseEntity.ok(updatedLeaveType);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteLeaveType(@PathVariable Long id) {
        leaveTypeService.deleteLeaveType(id);
        return ResponseEntity.noContent().build();
    }
}
