package com.example.multi_tanent.tenant.attendance.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.attendance.dto.MissingAttendanceApprovalDto;
import com.example.multi_tanent.tenant.attendance.dto.MissingAttendanceRequestDto;
import com.example.multi_tanent.tenant.attendance.entity.AttendanceRecord;
import com.example.multi_tanent.tenant.attendance.entity.MissingAttendanceRequest;
import com.example.multi_tanent.tenant.attendance.enums.AttendanceStatus;
import com.example.multi_tanent.tenant.attendance.enums.MissingAttendanceRequestStatus;
import com.example.multi_tanent.tenant.attendance.repository.AttendanceRecordRepository;
import com.example.multi_tanent.tenant.attendance.repository.MissingAttendanceRequestRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.service.FileStorageService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

import com.example.multi_tanent.master.enums.Role;
import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.service.NotificationService;

@Service
@Transactional(transactionManager = "tenantTx")
public class MissingAttendanceService {

    private final MissingAttendanceRequestRepository requestRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceRecordService attendanceRecordService;
    private final FileStorageService fileStorageService;
    private final NotificationService notificationService;

    public MissingAttendanceService(MissingAttendanceRequestRepository requestRepository,
                                    EmployeeRepository employeeRepository,
                                    UserRepository userRepository,
                                    AttendanceRecordRepository attendanceRecordRepository,
                                    AttendanceRecordService attendanceRecordService,
                                    FileStorageService fileStorageService,
                                    NotificationService notificationService) {
        this.requestRepository = requestRepository;
        this.employeeRepository = employeeRepository;
        this.userRepository = userRepository;
        this.attendanceRecordRepository = attendanceRecordRepository;
        this.attendanceRecordService = attendanceRecordService;
        this.fileStorageService = fileStorageService;
        this.notificationService = notificationService;
    }

    public MissingAttendanceRequest createRequest(String employeeCode, MissingAttendanceRequestDto requestDto, MultipartFile file) {
        Employee employee = employeeRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found: " + employeeCode));

        MissingAttendanceRequest request = new MissingAttendanceRequest();
        request.setEmployee(employee);
        request.setAttendanceDate(requestDto.getAttendanceDate());
        request.setRequestedCheckIn(requestDto.getRequestedCheckIn());
        request.setRequestedCheckOut(requestDto.getRequestedCheckOut());
        request.setReason(requestDto.getReason());
        request.setStatus(MissingAttendanceRequestStatus.PENDING);

        if (file != null && !file.isEmpty()) {
            String filePath = fileStorageService.storeFile(file, "missing-attendance-attachments");
            request.setAttachmentPath(filePath);
        }

        MissingAttendanceRequest savedRequest = requestRepository.save(request);

        String empName = employee.getFirstName() + " " + (employee.getLastName() != null ? employee.getLastName() : "");
        String msg = empName.trim() + " submitted a missing attendance request for " + savedRequest.getAttendanceDate() +
                     " (Check-In: " + savedRequest.getRequestedCheckIn() + ", Check-Out: " + savedRequest.getRequestedCheckOut() + ").";

        Set<User> recipients = new HashSet<>();
        userRepository.findActiveUsersByRole(Role.HR).forEach(recipients::add);
        userRepository.findActiveUsersByRole(Role.HRMS_ADMIN).forEach(recipients::add);
        userRepository.findActiveUsersByRole(Role.SUPER_ADMIN).forEach(recipients::add);

        // Fallback: Notify active users if recipients list is empty
        if (recipients.isEmpty()) {
            userRepository.findAll().stream()
                .filter(u -> u.getIsActive() == null || Boolean.TRUE.equals(u.getIsActive()))
                .forEach(recipients::add);
        }

        for (User recipient : recipients) {
            notificationService.send(
                recipient.getId(),
                NotificationType.MISSING_ATTENDANCE_SUBMITTED,
                "Missing Attendance Request",
                msg,
                "/attendance",
                savedRequest.getId(),
                "MISSING_ATTENDANCE",
                NotificationPriority.MEDIUM
            );
        }

        return requestRepository.findByIdWithDetails(savedRequest.getId()).orElse(savedRequest);
    }

    public MissingAttendanceRequest approveOrRejectRequest(Long requestId, MissingAttendanceApprovalDto approvalDto) {
        MissingAttendanceRequest request = requestRepository.findByIdWithDetails(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found: " + requestId));

        if (request.getStatus() != MissingAttendanceRequestStatus.PENDING) {
            throw new IllegalStateException("Request is not in PENDING state.");
        }

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User approver = userRepository.findByEmail(username)
                .orElseThrow(() -> new EntityNotFoundException("Approver not found."));

        request.setStatus(approvalDto.getStatus());
        request.setApprover(approver);
        request.setApprovalDate(LocalDateTime.now());
        request.setApproverRemarks(approvalDto.getApproverRemarks());

        if (approvalDto.getStatus() == MissingAttendanceRequestStatus.APPROVED) {
            // Find or create the attendance record for that day
            AttendanceRecord record = attendanceRecordRepository
                    .findByEmployeeEmployeeCodeAndAttendanceDate(request.getEmployee().getEmployeeCode(), request.getAttendanceDate())
                    .orElse(new AttendanceRecord());

            record.setEmployee(request.getEmployee());
            record.setAttendanceDate(request.getAttendanceDate());
            record.setCheckIn(request.getRequestedCheckIn());
            record.setCheckOut(request.getRequestedCheckOut());
            record.setStatus(AttendanceStatus.PRESENT); // Mark as present
            record.setRemarks("Regularized via missing attendance request #" + request.getId());

            AttendanceRecord savedRecord = attendanceRecordRepository.save(record);
            attendanceRecordService.recalculateAttendance(savedRecord.getId()); // Recalculate late, overtime, etc.
        }

        MissingAttendanceRequest savedRequest = requestRepository.save(request);

        if (savedRequest.getEmployee() != null && savedRequest.getEmployee().getUser() != null) {
            Long userId = savedRequest.getEmployee().getUser().getId();
            
            if (approvalDto.getStatus() == MissingAttendanceRequestStatus.APPROVED) {
                notificationService.send(
                    userId,
                    NotificationType.MISSING_ATTENDANCE_APPROVED,
                    "Attendance Regularization Approved",
                    "Your missing attendance request for " + savedRequest.getAttendanceDate() + " has been approved.",
                    "/attendance",
                    savedRequest.getId(),
                    "MISSING_ATTENDANCE",
                    NotificationPriority.HIGH
                );
            } else if (approvalDto.getStatus() == MissingAttendanceRequestStatus.REJECTED) {
                notificationService.send(
                    userId,
                    NotificationType.MISSING_ATTENDANCE_REJECTED,
                    "Attendance Regularization Rejected",
                    "Your missing attendance request for " + savedRequest.getAttendanceDate() + " was rejected." +
                        (approvalDto.getApproverRemarks() != null ? " Reason: " + approvalDto.getApproverRemarks() : ""),
                    "/attendance",
                    savedRequest.getId(),
                    "MISSING_ATTENDANCE",
                    NotificationPriority.HIGH
                );
            }
        }

        return requestRepository.findByIdWithDetails(savedRequest.getId()).orElse(savedRequest);
    }

    @Transactional(readOnly = true)
    public List<MissingAttendanceRequest> getAllRequests() {
        return requestRepository.findAllWithEmployee();
    }

    @Transactional(readOnly = true)
    public Optional<MissingAttendanceRequest> getRequestById(Long requestId) {
        return requestRepository.findByIdWithDetails(requestId);
    }

    public Resource loadAttachmentFile(Long requestId) {
        MissingAttendanceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new EntityNotFoundException("Request not found: " + requestId));
        if (request.getAttachmentPath() == null || request.getAttachmentPath().isEmpty()) {
            throw new EntityNotFoundException("No attachment found for request id: " + requestId);
        }
        return fileStorageService.loadFileAsResource(request.getAttachmentPath());
    }
}