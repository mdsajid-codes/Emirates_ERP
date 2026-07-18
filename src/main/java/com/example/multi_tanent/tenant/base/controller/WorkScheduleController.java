package com.example.multi_tanent.tenant.base.controller;

import com.example.multi_tanent.tenant.base.dto.WorkScheduleRequest;
import com.example.multi_tanent.tenant.base.dto.WorkScheduleResponse;
import com.example.multi_tanent.tenant.base.entity.WorkSchedule;
import com.example.multi_tanent.tenant.base.service.WorkScheduleService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-schedules")
public class WorkScheduleController {

    private final WorkScheduleService workScheduleService;

    public WorkScheduleController(WorkScheduleService workScheduleService) {
        this.workScheduleService = workScheduleService;
    }

    @GetMapping
    public ResponseEntity<List<WorkScheduleResponse>> getAll() {
        return ResponseEntity.ok(workScheduleService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkScheduleResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(workScheduleService.getById(id));
    }

    @PostMapping
    public ResponseEntity<WorkScheduleResponse> create(@RequestBody WorkScheduleRequest request) {
        return ResponseEntity.ok(workScheduleService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkScheduleResponse> update(@PathVariable Long id,
            @RequestBody WorkScheduleRequest request) {
        return ResponseEntity.ok(workScheduleService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        workScheduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
