package com.example.multi_tanent.tenant.leave.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.leave.dto.LeaveApprovalRequest;
import com.example.multi_tanent.tenant.leave.dto.LeaveRequestDto;
import com.example.multi_tanent.tenant.leave.dto.LeaveRequestResponseDto;
import com.example.multi_tanent.tenant.leave.entity.LeaveApproval;
import com.example.multi_tanent.tenant.leave.entity.LeaveBalance;
import com.example.multi_tanent.tenant.leave.entity.LeaveRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveType;
import com.example.multi_tanent.tenant.leave.enums.ApprovalAction;
import com.example.multi_tanent.tenant.leave.enums.LeaveStatus;
import com.example.multi_tanent.tenant.leave.repository.LeaveApprovalRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveBalanceRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveRequestRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveTypeRepository;
import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LeaveNotificationEventTest {

    @Mock private LeaveRequestRepository leaveRequestRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private LeaveTypeRepository leaveTypeRepository;
    @Mock private LeaveBalanceRepository leaveBalanceRepository;
    @Mock private LeaveApprovalRepository leaveApprovalRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;
    @Mock private Authentication authentication;
    @Mock private SecurityContext securityContext;

    @InjectMocks private LeaveRequestService leaveRequestService;
    @InjectMocks private LeaveApprovalService leaveApprovalService;

    private User employeeUser;
    private User approverUser;
    private Employee employee;
    private LeaveType leaveType;
    private LeaveBalance leaveBalance;

    @BeforeEach
    void setUp() {
        employeeUser = new User();
        employeeUser.setId(101L);
        employeeUser.setEmail("employee@emirateserp.ae");

        approverUser = new User();
        approverUser.setId(202L);
        approverUser.setEmail("manager@emirateserp.ae");

        employee = new Employee();
        employee.setId(1L);
        employee.setEmployeeCode("EMP001");
        employee.setFirstName("Sajid");
        employee.setLastName("Khan");
        employee.setUser(employeeUser);

        leaveType = new LeaveType();
        leaveType.setId(10L);
        leaveType.setLeaveType("Annual Leave");

        leaveBalance = new LeaveBalance();
        leaveBalance.setTotalAllocated(BigDecimal.valueOf(20));
        leaveBalance.setPending(BigDecimal.ZERO);
        leaveBalance.setUsed(BigDecimal.ZERO);

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    @DisplayName("Phase 2: Submitting a Leave Request sends LEAVE_REQUEST_SUBMITTED notification to approver")
    void createLeaveRequest_SendsNotificationToApprover() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("employee@emirateserp.ae");
        when(userRepository.findByEmail("employee@emirateserp.ae")).thenReturn(Optional.of(employeeUser));
        when(employeeRepository.findByEmployeeCode("EMP001")).thenReturn(Optional.of(employee));
        when(leaveTypeRepository.findByLeaveType("Annual Leave")).thenReturn(Optional.of(leaveType));
        when(leaveBalanceRepository.findFirstByEmployeeIdAndLeaveTypeIdOrderByAsOfDateDesc(1L, 10L))
            .thenReturn(Optional.of(leaveBalance));

        LeaveRequest savedRequest = new LeaveRequest();
        savedRequest.setId(500L);
        savedRequest.setEmployee(employee);
        savedRequest.setLeaveType(leaveType);
        savedRequest.setCurrentApproverUserId(202L);
        savedRequest.setStatus(LeaveStatus.SUBMITTED);

        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(savedRequest);

        LeaveRequestDto requestDto = new LeaveRequestDto();
        requestDto.setEmployeeCode("EMP001");
        requestDto.setLeaveType("Annual Leave");
        requestDto.setFromDate(LocalDate.now());
        requestDto.setToDate(LocalDate.now().plusDays(2));
        requestDto.setDaysRequested(BigDecimal.valueOf(3));

        leaveRequestService.createLeaveRequest(requestDto);

        verify(notificationService, times(1)).send(
            eq(202L),
            eq(NotificationType.LEAVE_REQUEST_SUBMITTED),
            contains("New Leave Request"),
            contains("Sajid Khan has submitted a Annual Leave"),
            eq("/leave"),
            eq(500L),
            eq("LEAVE_REQUEST"),
            eq(NotificationPriority.MEDIUM)
        );
    }

    @Test
    @DisplayName("Phase 2: Approving a Leave Request sends LEAVE_REQUEST_APPROVED notification to employee")
    void processApproval_Approved_SendsNotificationToEmployee() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("manager@emirateserp.ae");
        when(userRepository.findByEmail("manager@emirateserp.ae")).thenReturn(Optional.of(approverUser));

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setId(500L);
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStatus(LeaveStatus.SUBMITTED);
        leaveRequest.setDaysRequested(BigDecimal.valueOf(3));

        when(leaveRequestRepository.findById(500L)).thenReturn(Optional.of(leaveRequest));
        when(leaveBalanceRepository.findFirstByEmployeeIdAndLeaveTypeIdOrderByAsOfDateDesc(1L, 10L))
            .thenReturn(Optional.of(leaveBalance));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        LeaveApprovalRequest approvalRequest = new LeaveApprovalRequest();
        approvalRequest.setLeaveRequestId(500L);
        approvalRequest.setAction(ApprovalAction.APPROVED);
        approvalRequest.setComment("Approved. Enjoy your leave.");

        leaveApprovalService.processApproval(approvalRequest);

        verify(notificationService, times(1)).send(
            eq(101L),
            eq(NotificationType.LEAVE_REQUEST_APPROVED),
            contains("Approved"),
            contains("leave request from"),
            eq("/leave"),
            eq(500L),
            eq("LEAVE_REQUEST"),
            eq(NotificationPriority.HIGH)
        );
    }

    @Test
    @DisplayName("Phase 2: Rejecting a Leave Request sends LEAVE_REQUEST_REJECTED notification to employee")
    void processApproval_Rejected_SendsNotificationToEmployee() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("manager@emirateserp.ae");
        when(userRepository.findByEmail("manager@emirateserp.ae")).thenReturn(Optional.of(approverUser));

        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setId(500L);
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setStatus(LeaveStatus.SUBMITTED);
        leaveRequest.setDaysRequested(BigDecimal.valueOf(3));

        when(leaveRequestRepository.findById(500L)).thenReturn(Optional.of(leaveRequest));
        when(leaveBalanceRepository.findFirstByEmployeeIdAndLeaveTypeIdOrderByAsOfDateDesc(1L, 10L))
            .thenReturn(Optional.of(leaveBalance));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenReturn(leaveRequest);

        LeaveApprovalRequest approvalRequest = new LeaveApprovalRequest();
        approvalRequest.setLeaveRequestId(500L);
        approvalRequest.setAction(ApprovalAction.REJECTED);
        approvalRequest.setComment("Project deadline ahead.");

        leaveApprovalService.processApproval(approvalRequest);

        verify(notificationService, times(1)).send(
            eq(101L),
            eq(NotificationType.LEAVE_REQUEST_REJECTED),
            contains("Rejected"),
            contains("Reason: Project deadline ahead."),
            eq("/leave"),
            eq(500L),
            eq("LEAVE_REQUEST"),
            eq(NotificationPriority.HIGH)
        );
    }
}
