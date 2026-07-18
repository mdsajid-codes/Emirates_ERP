package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProWorkGroupDto;
import com.example.multi_tanent.production.dto.ProWorkGroupRequest;
import com.example.multi_tanent.production.services.ProWorkGroupService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/work-groups")
@PreAuthorize("isAuthenticated()")
public class ProWorkGroupController {

    private final ProWorkGroupService workGroupService;

    public ProWorkGroupController(ProWorkGroupService workGroupService) {
        this.workGroupService = workGroupService;
    }

    @PostMapping
    public ResponseEntity<ProWorkGroupDto> createWorkGroup(@Valid @RequestBody ProWorkGroupRequest request) {
        ProWorkGroupDto created = workGroupService.createWorkGroup(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public List<ProWorkGroupDto> getAllWorkGroups() {
        return workGroupService.getAllWorkGroups();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProWorkGroupDto> getWorkGroupById(@PathVariable Long id) {
        ProWorkGroupDto dto = workGroupService.getWorkGroupById(id);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProWorkGroupDto> updateWorkGroup(@PathVariable Long id, @Valid @RequestBody ProWorkGroupRequest request) {
        ProWorkGroupDto updated = workGroupService.updateWorkGroup(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteWorkGroup(@PathVariable Long id) {
        workGroupService.deleteWorkGroup(id);
        return ResponseEntity.noContent().build();
    }
}
