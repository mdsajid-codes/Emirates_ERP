package com.example.multi_tanent.tenant.attendance.service;

import com.example.multi_tanent.master.enums.Role;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.attendance.dto.MissingAttendanceApprovalDto;
import com.example.multi_tanent.tenant.attendance.dto.MissingAttendanceRequestDto;
import com.example.multi_tanent.tenant.attendance.entity.MissingAttendanceRequest;
import com.example.multi_tanent.tenant.attendance.enums.MissingAttendanceRequestStatus;
import com.example.multi_tanent.tenant.attendance.repository.AttendanceRecordRepository;
import com.example.multi_tanent.tenant.attendance.repository.MissingAttendanceRequestRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.service.NotificationService;
import com.example.multi_tanent.tenant.service.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.contains;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AttendanceNotificationEventTest {

    @Mock private MissingAttendanceRequestRepository requestRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private UserRepository userRepository;
    @Mock private AttendanceRecordRepository attendanceRecordRepository;
    @Mock private AttendanceRecordService attendanceRecordService;
    @Mock private FileStorageService fileStorageService;
    @Mock private NotificationService notificationService;
    @Mock private Authentication authentication;
    @Mock private SecurityContext securityContext;

    @InjectMocks private MissingAttendanceService missingAttendanceService;

    private User employeeUser;
    private User hrUser;
    private Employee employee;

    @BeforeEach
    void setUp() {
        employeeUser = new User();
        employeeUser.setId(30L);
        employeeUser.setEmail("emp30@emirateserp.ae");

        hrUser = new User();
        hrUser.setId(40L);
        hrUser.setEmail("hr40@emirateserp.ae");

        employee = new Employee();
        employee.setId(3L);
        employee.setEmployeeCode("EMP300");
        employee.setFirstName("Fatima");
        employee.setUser(employeeUser);

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Phase 4: Submitting missing attendance sends MISSING_ATTENDANCE_SUBMITTED notification to HR")
    void createRequest_SendsNotificationToHR() {
        when(employeeRepository.findByEmployeeCode("EMP300")).thenReturn(Optional.of(employee));
        when(userRepository.findActiveUsersByRole(Role.HR)).thenReturn(List.of(hrUser));

        MissingAttendanceRequest req = new MissingAttendanceRequest();
        req.setId(77L);
        req.setEmployee(employee);
        req.setAttendanceDate(LocalDate.now().minusDays(1));
        req.setRequestedCheckIn(LocalTime.of(9, 0));
        req.setRequestedCheckOut(LocalTime.of(18, 0));

        when(requestRepository.save(any(MissingAttendanceRequest.class))).thenReturn(req);
        when(requestRepository.findByIdWithDetails(77L)).thenReturn(Optional.of(req));

        MissingAttendanceRequestDto dto = new MissingAttendanceRequestDto();
        dto.setAttendanceDate(LocalDate.now().minusDays(1));
        dto.setRequestedCheckIn(LocalTime.of(9, 0));
        dto.setRequestedCheckOut(LocalTime.of(18, 0));

        missingAttendanceService.createRequest("EMP300", dto, null);

        verify(notificationService, times(1)).send(
            eq(40L),
            eq(NotificationType.MISSING_ATTENDANCE_SUBMITTED),
            contains("Missing Attendance Request"),
            contains("Fatima submitted a missing attendance request"),
            eq("/attendance"),
            eq(77L),
            eq("MISSING_ATTENDANCE"),
            eq(NotificationPriority.MEDIUM)
        );
    }

    @Test
    @DisplayName("Phase 4: Approving missing attendance sends MISSING_ATTENDANCE_APPROVED notification to Employee")
    void approveRequest_SendsNotificationToEmployee() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("hr40@emirateserp.ae");
        when(userRepository.findByEmail("hr40@emirateserp.ae")).thenReturn(Optional.of(hrUser));

        MissingAttendanceRequest req = new MissingAttendanceRequest();
        req.setId(77L);
        req.setEmployee(employee);
        req.setAttendanceDate(LocalDate.now().minusDays(1));
        req.setRequestedCheckIn(LocalTime.of(9, 0));
        req.setRequestedCheckOut(LocalTime.of(18, 0));
        req.setStatus(MissingAttendanceRequestStatus.PENDING);

        com.example.multi_tanent.tenant.attendance.entity.AttendanceRecord record = new com.example.multi_tanent.tenant.attendance.entity.AttendanceRecord();
        record.setId(1001L);

        when(requestRepository.findByIdWithDetails(77L)).thenReturn(Optional.of(req));
        when(attendanceRecordRepository.findByEmployeeEmployeeCodeAndAttendanceDate(any(), any()))
            .thenReturn(Optional.empty());
        when(attendanceRecordRepository.save(any())).thenReturn(record);
        when(requestRepository.save(any(MissingAttendanceRequest.class))).thenReturn(req);

        MissingAttendanceApprovalDto approvalDto = new MissingAttendanceApprovalDto();
        approvalDto.setStatus(MissingAttendanceRequestStatus.APPROVED);
        approvalDto.setApproverRemarks("Approved by HR");

        missingAttendanceService.approveOrRejectRequest(77L, approvalDto);

        verify(notificationService, times(1)).send(
            eq(30L),
            eq(NotificationType.MISSING_ATTENDANCE_APPROVED),
            contains("Approved"),
            contains("request for"),
            eq("/attendance"),
            eq(77L),
            eq("MISSING_ATTENDANCE"),
            eq(NotificationPriority.HIGH)
        );
    }
}
