package com.example.multi_tanent.tenant.base.controller;

import com.example.multi_tanent.tenant.base.dto.WorkCalendarExceptionRequest;
import com.example.multi_tanent.tenant.base.dto.WorkCalendarExceptionResponse;
import com.example.multi_tanent.tenant.base.service.WorkCalendarExceptionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-calendar-exceptions")
public class WorkCalendarExceptionController {

    private final WorkCalendarExceptionService exceptionService;

    public WorkCalendarExceptionController(WorkCalendarExceptionService exceptionService) {
        this.exceptionService = exceptionService;
    }

    @GetMapping
    public ResponseEntity<List<WorkCalendarExceptionResponse>> getByPolicy(@RequestParam Long policyId) {
        return ResponseEntity.ok(exceptionService.getByPolicyId(policyId));
    }

    @PostMapping
    public ResponseEntity<WorkCalendarExceptionResponse> create(@RequestBody WorkCalendarExceptionRequest request) {
        return ResponseEntity.ok(exceptionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkCalendarExceptionResponse> update(@PathVariable Long id, @RequestBody WorkCalendarExceptionRequest request) {
        return ResponseEntity.ok(exceptionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        exceptionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
