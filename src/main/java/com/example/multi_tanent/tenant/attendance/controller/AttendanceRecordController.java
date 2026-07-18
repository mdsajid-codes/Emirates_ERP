package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.dto.AttendanceRecordRequest;
import com.example.multi_tanent.tenant.attendance.dto.AttendanceRecordResponse;
import com.example.multi_tanent.tenant.attendance.service.AttendanceRecordService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/attendance-records")
@CrossOrigin(origins = "*")
public class AttendanceRecordController {

    private final AttendanceRecordService attendanceService;

    public AttendanceRecordController(AttendanceRecordService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<AttendanceRecordResponse> markAttendance(@RequestBody AttendanceRecordRequest request) {
        AttendanceRecordResponse createdRecord = attendanceService.markAttendance(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdRecord.getId()).toUri();
        return ResponseEntity.created(location).body(createdRecord);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'HR', 'EMPLOYEE')")
    public ResponseEntity<AttendanceRecordResponse> updateAttendance(@PathVariable Long id, @RequestBody AttendanceRecordRequest request) {
        return ResponseEntity.ok(attendanceService.updateAttendance(id, request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'HR')")
    public ResponseEntity<List<AttendanceRecordResponse>> getAllAttendanceRecords() {
        List<AttendanceRecordResponse> records = attendanceService.getAllAttendanceRecords()
 .stream()
 .map(AttendanceRecordResponse::fromEntity)
 .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }


    @GetMapping("/employee/{employeeCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttendanceRecordResponse>> getAttendanceForEmployee(
            @PathVariable String employeeCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<AttendanceRecordResponse> records = attendanceService.getAttendanceForEmployee(employeeCode, startDate, endDate)
                .stream()
                .map(AttendanceRecordResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

     @GetMapping(params = "date")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'HR')")
    public ResponseEntity<List<AttendanceRecordResponse>> getAttendanceForDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<AttendanceRecordResponse> records = attendanceService.getAttendanceForDate(date)
                .stream()
                .map(AttendanceRecordResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(records);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN', 'HR')")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        attendanceService.deleteAttendanceRecord(id);
        return ResponseEntity.noContent().build();
    }
}