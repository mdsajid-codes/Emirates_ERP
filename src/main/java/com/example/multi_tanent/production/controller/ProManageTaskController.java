package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProManageTaskDto;
import com.example.multi_tanent.production.dto.ProManageTaskRequest;
import com.example.multi_tanent.production.services.ProManageTaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/manage-tasks")
@PreAuthorize("isAuthenticated()")
public class ProManageTaskController {

    private final ProManageTaskService manageTaskService;

    public ProManageTaskController(ProManageTaskService manageTaskService) {
        this.manageTaskService = manageTaskService;
    }

    @PostMapping
    public ResponseEntity<ProManageTaskDto> createManageTask(@Valid @RequestBody ProManageTaskRequest request) {
        return new ResponseEntity<>(manageTaskService.createManageTask(request), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ProManageTaskDto> getAllManageTasks() {
        return manageTaskService.getAllManageTasks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProManageTaskDto> getManageTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(manageTaskService.getManageTaskById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProManageTaskDto> updateManageTask(@PathVariable Long id, @Valid @RequestBody ProManageTaskRequest request) {
        return ResponseEntity.ok(manageTaskService.updateManageTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteManageTask(@PathVariable Long id) {
        manageTaskService.deleteManageTask(id);
        return ResponseEntity.noContent().build();
    }
}
