package com.example.multi_tanent.tenant.employee.controller;

import com.example.multi_tanent.tenant.base.dto.LeaveGroupRequest;
import com.example.multi_tanent.tenant.base.entity.LeaveGroup;
import com.example.multi_tanent.tenant.base.repository.LeaveGroupRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;

@RestController
@RequestMapping("/api/leave-groups")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class LeaveGroupController {

    private final LeaveGroupRepository leaveGroupRepository;
    private final TenantModuleChecker moduleChecker;

    public LeaveGroupController(LeaveGroupRepository leaveGroupRepository, TenantModuleChecker moduleChecker) {
        this.leaveGroupRepository = leaveGroupRepository;
        this.moduleChecker = moduleChecker;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createLeaveGroup(@RequestBody LeaveGroupRequest request) {
        if (leaveGroupRepository.findByCode(request.getCode()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A leave group with the code '" + request.getCode() + "' already exists.");
        }
        if (leaveGroupRepository.findByName(request.getName()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A leave group with the name '" + request.getName() + "' already exists.");
        }

        LeaveGroup leaveGroup = new LeaveGroup();
        leaveGroup.setCode(request.getCode());
        leaveGroup.setName(request.getName());

        LeaveGroup savedLeaveGroup = leaveGroupRepository.save(leaveGroup);

        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(savedLeaveGroup.getId()).toUri();

        return ResponseEntity.created(location).body(savedLeaveGroup);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<LeaveGroup>> getAllLeaveGroups() {
        if (!moduleChecker.hasModule(ServiceModule.HRMS_CORE)) {
            return ResponseEntity.ok(java.util.Collections.emptyList());
        }
        return ResponseEntity.ok(leaveGroupRepository.findAll());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<LeaveGroup> getLeaveGroupById(@PathVariable Long id) {
        return leaveGroupRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> updateLeaveGroup(@PathVariable Long id, @RequestBody LeaveGroupRequest request) {
        Optional<LeaveGroup> existingByCode = leaveGroupRepository.findByCode(request.getCode());
        if (existingByCode.isPresent() && !existingByCode.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another leave group with the code '" + request.getCode() + "' already exists.");
        }
        Optional<LeaveGroup> existingByName = leaveGroupRepository.findByName(request.getName());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Another leave group with the name '" + request.getName() + "' already exists.");
        }

        return leaveGroupRepository.findById(id)
                .map(leaveGroup -> {
                    leaveGroup.setCode(request.getCode());
                    leaveGroup.setName(request.getName());
                    LeaveGroup updatedLeaveGroup = leaveGroupRepository.save(leaveGroup);
                    return ResponseEntity.ok(updatedLeaveGroup);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteLeaveGroup(@PathVariable Long id) {
        return leaveGroupRepository.findById(id)
                .map(leaveGroup -> {
                    leaveGroupRepository.delete(leaveGroup);
                    return ResponseEntity.noContent().<Void>build();
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
