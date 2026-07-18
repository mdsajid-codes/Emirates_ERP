package com.example.multi_tanent.production.controller;

import com.example.multi_tanent.production.dto.ProTaskDto;
import com.example.multi_tanent.production.dto.ProTaskRequest;
import com.example.multi_tanent.production.services.ProTaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/production/tasks")
@PreAuthorize("isAuthenticated()")
public class ProTaskController {

    private final ProTaskService taskService;

    public ProTaskController(ProTaskService taskService) {
        this.taskService = taskService;
    }

    @PostMapping
    public ResponseEntity<ProTaskDto> createTask(@Valid @RequestBody ProTaskRequest request) {
        return new ResponseEntity<>(taskService.createTask(request), HttpStatus.CREATED);
    }

    @GetMapping
    public List<ProTaskDto> getAllTasks() {
        return taskService.getAllTasks();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProTaskDto> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProTaskDto> updateTask(@PathVariable Long id, @Valid @RequestBody ProTaskRequest request) {
        return ResponseEntity.ok(taskService.updateTask(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }
}
