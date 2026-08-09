package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.dto.EmployeeShiftAssignmentRequest;
import com.example.multi_tanent.tenant.attendance.dto.EmployeeShiftAssignmentResponse;
import com.example.multi_tanent.tenant.attendance.entity.EmployeeShiftAssignment;
import com.example.multi_tanent.tenant.attendance.repository.EmployeeShiftAssignmentRepository;
import com.example.multi_tanent.tenant.base.repository.ShiftTypeRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.service.NotificationService;

@RestController
@RequestMapping("/api/employee-shifts")
@CrossOrigin(origins = "*")
@Transactional(transactionManager = "tenantTx")
public class EmployeeShiftAssignmentController {

    private final EmployeeShiftAssignmentRepository repository;
    private final EmployeeRepository employeeRepository;
    private final ShiftTypeRepository shiftTypeRepository;
    private final NotificationService notificationService;

    public EmployeeShiftAssignmentController(EmployeeShiftAssignmentRepository repository,
                                             EmployeeRepository employeeRepository,
                                             ShiftTypeRepository shiftTypeRepository,
                                             NotificationService notificationService) {
        this.repository = repository;
        this.employeeRepository = employeeRepository;
        this.shiftTypeRepository = shiftTypeRepository;
        this.notificationService = notificationService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<?> createAssignment(@RequestBody EmployeeShiftAssignmentRequest request) {
        // Validation: No double booking for same date
        if (repository.findByEmployee_IdAndAssignedDate(request.getEmployeeId(), request.getAssignedDate()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("The employee already has a shift assigned for " + request.getAssignedDate());
        }

        EmployeeShiftAssignment assignment = new EmployeeShiftAssignment();
        assignment.setEmployee(employeeRepository.findById(request.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found")));
        assignment.setShiftType(shiftTypeRepository.findById(request.getShiftTypeId())
                .orElseThrow(() -> new RuntimeException("Shift type not found")));
        assignment.setAssignedDate(request.getAssignedDate());
        assignment.setNotes(request.getNotes());

        EmployeeShiftAssignment saved = repository.save(assignment);

        if (saved.getEmployee() != null && saved.getEmployee().getUser() != null) {
            String shiftName = saved.getShiftType() != null ? saved.getShiftType().getName() : "Shift";
            notificationService.send(
                saved.getEmployee().getUser().getId(),
                NotificationType.SHIFT_ASSIGNED,
                "New Shift Assigned",
                "You have been assigned to shift '" + shiftName + "' for date " + saved.getAssignedDate() + ".",
                "/attendance",
                saved.getId(),
                "SHIFT_ASSIGNMENT",
                NotificationPriority.MEDIUM
            );
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(saved));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<EmployeeShiftAssignmentResponse>> getAllAssignments(@RequestParam(required = false) Long employeeId,
                                                           @RequestParam(required = false) LocalDate date) {
        List<EmployeeShiftAssignment> assignments;
        if (employeeId != null) {
            assignments = repository.findByEmployee_Id(employeeId);
        } else if (date != null) {
            assignments = repository.findByAssignedDate(date);
        } else {
            assignments = repository.findAll();
        }

        List<EmployeeShiftAssignmentResponse> responses = assignments.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }

    private EmployeeShiftAssignmentResponse mapToResponse(EmployeeShiftAssignment entity) {
        EmployeeShiftAssignmentResponse resp = new EmployeeShiftAssignmentResponse();
        resp.setId(entity.getId());
        resp.setAssignedDate(entity.getAssignedDate());
        resp.setNotes(entity.getNotes());

        if (entity.getEmployee() != null) {
            resp.setEmployeeId(entity.getEmployee().getId());
            resp.setEmployeeName(entity.getEmployee().getName());
            resp.setEmployeeCode(entity.getEmployee().getEmployeeCode());
        }

        if (entity.getShiftType() != null) {
            resp.setShiftTypeId(entity.getShiftType().getId());
            resp.setShiftTypeName(entity.getShiftType().getName());
            resp.setStartTime(entity.getShiftType().getStartTime());
            resp.setEndTime(entity.getShiftType().getEndTime());
        }

        return resp;
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
