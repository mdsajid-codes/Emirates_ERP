package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.dto.ShiftPolicyResponse;
import com.example.multi_tanent.tenant.attendance.dto.ShiftPolicyRequest;
import com.example.multi_tanent.tenant.attendance.service.ShiftPolicyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/shift-policies")
@CrossOrigin(origins = "*")
public class ShiftPolicyController {

    private final ShiftPolicyService shiftPolicyService;

    public ShiftPolicyController(ShiftPolicyService shiftPolicyService) {
        this.shiftPolicyService = shiftPolicyService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<ShiftPolicyResponse> createShiftPolicy(@RequestBody ShiftPolicyRequest request) {
        ShiftPolicyResponse createdPolicy = shiftPolicyService.createShiftPolicy(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdPolicy.getId()).toUri();
        return ResponseEntity.created(location).body(createdPolicy);
    }

    @GetMapping
    public ResponseEntity<List<ShiftPolicyResponse>> getAllShiftPolicies() {
        return ResponseEntity.ok(shiftPolicyService.getAllShiftPolicies());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ShiftPolicyResponse> getShiftPolicyById(@PathVariable Long id) {
        return shiftPolicyService.getShiftPolicyById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<ShiftPolicyResponse> updateShiftPolicy(@PathVariable Long id, @RequestBody ShiftPolicyRequest request) {
        ShiftPolicyResponse updatedPolicy = shiftPolicyService.updateShiftPolicy(id, request);
        return ResponseEntity.ok(updatedPolicy);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteShiftPolicy(@PathVariable Long id) {
        shiftPolicyService.deleteShiftPolicy(id);
        return ResponseEntity.noContent().build();
    }
}
