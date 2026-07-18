package com.example.multi_tanent.tenant.employee.controller;

import com.example.multi_tanent.tenant.attendance.repository.AttendancePolicyRepository;
import com.example.multi_tanent.tenant.base.repository.LeaveGroupRepository;
import com.example.multi_tanent.tenant.base.repository.TimeTypeRepository;
import com.example.multi_tanent.tenant.base.repository.WeeklyOffPolicyRepository;
import com.example.multi_tanent.tenant.base.repository.WorkTypeRepository;
import com.example.multi_tanent.tenant.employee.dto.TimeAttendenceRequest;
import com.example.multi_tanent.tenant.employee.dto.TimeAttendenceResponse;
import com.example.multi_tanent.tenant.employee.entity.TimeAttendence;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.employee.repository.TimeAttendenceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.example.multi_tanent.tenant.attendance.service.AttendanceRecordService;
import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/time-attendence")
@CrossOrigin(origins = "*")
public class TimeAttendenceController {
    private final EmployeeRepository employeeRepository;
    private final TimeAttendenceRepository timeAttendenceRepository;
    private final TimeTypeRepository timeTypeRepository;
    private final WorkTypeRepository workTypeRepository;
    private final WeeklyOffPolicyRepository weeklyOffPolicyRepository;
    private final LeaveGroupRepository leaveGroupRepository;
    private final AttendancePolicyRepository attendancePolicyRepository;
    private final AttendanceRecordService attendanceRecordService;


    public TimeAttendenceController(EmployeeRepository employeeRepository,
                                    TimeAttendenceRepository timeAttendenceRepository,
                                    TimeTypeRepository timeTypeRepository,
                                    WorkTypeRepository workTypeRepository,
                                    WeeklyOffPolicyRepository weeklyOffPolicyRepository,
                                    LeaveGroupRepository leaveGroupRepository,
                                    AttendancePolicyRepository attendancePolicyRepository,
                                    AttendanceRecordService attendanceRecordService) {
        this.employeeRepository = employeeRepository;
        this.timeAttendenceRepository = timeAttendenceRepository;
        this.timeTypeRepository = timeTypeRepository;
        this.workTypeRepository = workTypeRepository;
        this.weeklyOffPolicyRepository = weeklyOffPolicyRepository;
        this.leaveGroupRepository = leaveGroupRepository;
        this.attendancePolicyRepository = attendancePolicyRepository;
        this.attendanceRecordService = attendanceRecordService;
    }

    @PutMapping("/{employeeCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    @Transactional(transactionManager = "tenantTx")
    public ResponseEntity<TimeAttendenceResponse> createOrUpdateTimeAttendence(@PathVariable String employeeCode, @RequestBody TimeAttendenceRequest request) {
        return employeeRepository.findByEmployeeCode(employeeCode)
                .map(employee -> {
                    TimeAttendence timeAttendence = timeAttendenceRepository.findByEmployeeId(employee.getId())
                            .orElse(new TimeAttendence());

                    boolean isNew = timeAttendence.getId() == null;
                    if (isNew) {
                        timeAttendence.setEmployee(employee);
                    }

                    updateTimeAttendenceFromRequest(timeAttendence, request);
                    TimeAttendence savedTimeAttendence = timeAttendenceRepository.save(timeAttendence);

                    if (isNew) {
                        URI location = ServletUriComponentsBuilder.fromCurrentContextPath()
                                .path("/api/time-attendence/{employeeCode}")
                                .buildAndExpand(employeeCode).toUri();
                        return ResponseEntity.created(location).body(TimeAttendenceResponse.fromEntity(savedTimeAttendence));
                    } else {
                        return ResponseEntity.ok(TimeAttendenceResponse.fromEntity(savedTimeAttendence));
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{employeeCode}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TimeAttendenceResponse> getTimeAttendence(@PathVariable String employeeCode) {
        return timeAttendenceRepository.findByEmployeeEmployeeCodeWithDetails(employeeCode)
                .map(timeAttendence -> ResponseEntity.ok(TimeAttendenceResponse.fromEntity(timeAttendence)))
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{employeeCode}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    @Transactional(transactionManager = "tenantTx")
    public ResponseEntity<Void> deleteTimeAttendence(@PathVariable String employeeCode) {
        return employeeRepository.findByEmployeeCode(employeeCode)
            .flatMap(employee -> timeAttendenceRepository.findByEmployeeId(employee.getId()))
            .map(timeAttendence -> {
                timeAttendenceRepository.delete(timeAttendence);
                return ResponseEntity.noContent().<Void>build();
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/auto-mark-absent")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR')")
    @Transactional(transactionManager = "tenantTx")
    public ResponseEntity<String> triggerAutoMarkAbsent(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            LocalDate processingDate = (date != null) ? date : LocalDate.now();
            attendanceRecordService.autoMarkAbsentEmployees(processingDate);
            return ResponseEntity.ok("Auto-marking absent employees process triggered successfully for " + processingDate);
        } catch (IllegalStateException e) {
            // This specific exception is now handled by the exception handler below.
            // We re-throw it so Spring can catch it and direct it to the handler.
            throw e;
        } catch (Exception e) { // Catch any other unexpected errors
            return ResponseEntity.internalServerError().body("Failed to trigger process: " + e.getMessage());
        }
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleIllegalStateException(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    private void updateTimeAttendenceFromRequest(TimeAttendence timeAttendence, TimeAttendenceRequest request) {
        if (request.getTimeTypeId() != null) {
            timeTypeRepository.findById(request.getTimeTypeId())
                    .ifPresentOrElse(timeAttendence::setTimeType, () -> { throw new EntityNotFoundException("TimeType not found"); });
        }
        if (request.getWorkTypeId() != null) {
            workTypeRepository.findById(request.getWorkTypeId())
                    .ifPresentOrElse(timeAttendence::setWorkType, () -> { throw new EntityNotFoundException("WorkType not found"); });
        }
        if (request.getWeeklyOffPolicyId() != null) {
            weeklyOffPolicyRepository.findById(request.getWeeklyOffPolicyId())
                    .ifPresentOrElse(timeAttendence::setWeeklyOffPolicy, () -> { throw new EntityNotFoundException("WeeklyOffPolicy not found"); });
        }
        if (request.getLeaveGroupId() != null) {
            leaveGroupRepository.findById(request.getLeaveGroupId())
                    .ifPresentOrElse(timeAttendence::setLeaveGroup, () -> { throw new EntityNotFoundException("LeaveGroup not found"); });
        }
        if (request.getAttendancePolicyId() != null) {
            attendancePolicyRepository.findById(request.getAttendancePolicyId())
                    .ifPresentOrElse(timeAttendence::setAttendancePolicy, () -> { throw new EntityNotFoundException("AttendancePolicy not found"); });
        }

        timeAttendence.setAttendenceCaptureScheme(request.getAttendenceCaptureScheme());
        timeAttendence.setHolidayList(request.getHolidayList());
        timeAttendence.setExpensePolicy(request.getExpensePolicy());
        timeAttendence.setIsRosterBasedEmployee(request.getIsRosterBasedEmployee());
    }
}
