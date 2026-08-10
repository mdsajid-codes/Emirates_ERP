package com.example.multi_tanent.tenant.leave.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.leave.dto.LeaveRequestResponseDto;
import com.example.multi_tanent.tenant.leave.dto.LeaveRequestDto;
import com.example.multi_tanent.tenant.leave.entity.LeaveBalance;
import com.example.multi_tanent.tenant.leave.entity.LeaveRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveType;
import com.example.multi_tanent.tenant.leave.enums.LeaveStatus;
import com.example.multi_tanent.tenant.leave.repository.LeaveBalanceRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveRequestRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveTypeRepository;
import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.service.NotificationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(transactionManager = "tenantTx")
public class LeaveRequestService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository,
                               EmployeeRepository employeeRepository,
                               LeaveTypeRepository leaveTypeRepository,
                               LeaveBalanceRepository leaveBalanceRepository,
                               UserRepository userRepository,
                               NotificationService notificationService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public LeaveRequestResponseDto createLeaveRequest(LeaveRequestDto requestDto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Current user not found."));

        Employee employee = employeeRepository.findByEmployeeCode(requestDto.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("Employee not found with code: " + requestDto.getEmployeeCode()));

        LeaveType leaveType = leaveTypeRepository.findByLeaveType(requestDto.getLeaveType())
                .orElseThrow(() -> new RuntimeException("Leave type '" + requestDto.getLeaveType() + "' not found."));

        // Validate leave balance
        LeaveBalance balance = getLatestLeaveBalance(employee.getId(), leaveType.getId());
        if (balance.getAvailable().compareTo(requestDto.getDaysRequested()) < 0) {
            throw new IllegalStateException("Insufficient leave balance. Available: " + balance.getAvailable() + ", Requested: " + requestDto.getDaysRequested());
        }

        // Update balance: move from available to pending
        // When a request is submitted, the requested days are moved to the 'pending' state.
        // They are no longer 'available' but are not yet 'used'.
        balance.setPending(balance.getPending().add(requestDto.getDaysRequested()));
        balance.setUpdatedAt(LocalDateTime.now());
        balance.setUpdatedByUserId(currentUser.getId());
        leaveBalanceRepository.save(balance);

        // Create leave request
        LeaveRequest leaveRequest = new LeaveRequest();
        leaveRequest.setEmployee(employee);
        leaveRequest.setLeaveType(leaveType);
        leaveRequest.setFromDate(requestDto.getFromDate());
        leaveRequest.setToDate(requestDto.getToDate());
        leaveRequest.setDaysRequested(requestDto.getDaysRequested());
        leaveRequest.setReason(requestDto.getReason());
        leaveRequest.setPartialDayInfo(requestDto.getPartialDayInfo());
        leaveRequest.setStatus(LeaveStatus.SUBMITTED);
        leaveRequest.setCreatedAt(LocalDateTime.now());
        leaveRequest.setCreatedByUserId(currentUser.getId());

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);

        String notificationTitle = "New Leave Request Pending Approval";
        String notificationMessage = employee.getFirstName() + " " + (employee.getLastName() != null ? employee.getLastName() : "") + 
            " has submitted a " + leaveType.getLeaveType() +
            " leave request from " + requestDto.getFromDate() +
            " to " + requestDto.getToDate() +
            " (" + requestDto.getDaysRequested() + " days). Please review.";

        java.util.Set<User> recipients = new java.util.HashSet<>();

        // If a specific line manager / approver is set, include them
        if (savedRequest.getCurrentApproverUserId() != null) {
            userRepository.findById(savedRequest.getCurrentApproverUserId()).ifPresent(recipients::add);
        }

        // Also fetch active HR, HRMS_ADMIN, and SUPER_ADMIN users
        List<User> hrUsers = userRepository.findActiveUsersByRole(com.example.multi_tanent.master.enums.Role.HR);
        List<User> hrAdmins = userRepository.findActiveUsersByRole(com.example.multi_tanent.master.enums.Role.HRMS_ADMIN);
        List<User> superAdmins = userRepository.findActiveUsersByRole(com.example.multi_tanent.master.enums.Role.SUPER_ADMIN);

        if (hrUsers != null) recipients.addAll(hrUsers);
        if (hrAdmins != null) recipients.addAll(hrAdmins);
        if (superAdmins != null) recipients.addAll(superAdmins);

        // Fail-safe: Always include all active users if list is small or empty so admins never miss notification
        List<User> allUsers = userRepository.findAll();
        if (allUsers != null) {
            allUsers.stream()
                .filter(u -> u.getIsActive() == null || Boolean.TRUE.equals(u.getIsActive()))
                .forEach(recipients::add);
        }

        String tenantId = com.example.multi_tanent.config.TenantContext.getTenantId();
        for (User recipient : recipients) {
            notificationService.sendWithTenant(
                tenantId,
                recipient.getId(),
                NotificationType.LEAVE_REQUEST_SUBMITTED,
                notificationTitle,
                notificationMessage,
                "/leave",
                savedRequest.getId(),
                "LEAVE_REQUEST",
                NotificationPriority.MEDIUM
            );
        }

        return LeaveRequestResponseDto.fromEntity(savedRequest);
    }

    @Transactional(readOnly = true)
    public Optional<LeaveRequestResponseDto> getLeaveRequestById(Long id) {
        return leaveRequestRepository.findById(id).map(LeaveRequestResponseDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDto> getLeaveRequestsByEmployeeCode(String employeeCode) {
        Employee employee = employeeRepository.findByEmployeeCode(employeeCode)
                .orElseThrow(() -> new RuntimeException("Employee not found with code: " + employeeCode));
        return leaveRequestRepository.findByEmployeeId(employee.getId())
                .stream()
                .map(LeaveRequestResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDto> getAllLeaveRequests() {
        return leaveRequestRepository.findAllWithDetails()
                .stream()
                .map(LeaveRequestResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    public LeaveRequestResponseDto cancelLeaveRequest(Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Current user not found."));

        LeaveRequest leaveRequest = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));

        if (leaveRequest.getStatus() != LeaveStatus.SUBMITTED) {
            throw new IllegalStateException("Only submitted leave requests can be cancelled. Current status: " + leaveRequest.getStatus());
        }

        leaveRequest.setStatus(LeaveStatus.CANCELLED);
        leaveRequest.setUpdatedAt(LocalDateTime.now());
        leaveRequest.setUpdatedByUserId(currentUser.getId());

        // Revert balance change
        LeaveBalance balance = getLatestLeaveBalance(leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType().getId());
        // When a request is cancelled, the 'pending' days are returned to the 'available' pool.
        // This is done by simply reducing the pending count.
        balance.setPending(balance.getPending().subtract(leaveRequest.getDaysRequested()));
        leaveBalanceRepository.save(balance);

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);

        String tenantId = com.example.multi_tanent.config.TenantContext.getTenantId();
        Employee emp = savedRequest.getEmployee();
        String empName = emp != null ? (emp.getFirstName() + " " + (emp.getLastName() != null ? emp.getLastName() : "")) : "Employee";
        String cancelMsg = empName.trim() + " has cancelled their " +
            savedRequest.getLeaveType().getLeaveType() + " leave request from " +
            savedRequest.getFromDate() + " to " + savedRequest.getToDate() + ".";

        java.util.Set<User> recipients = new java.util.HashSet<>();
        if (savedRequest.getCurrentApproverUserId() != null) {
            userRepository.findById(savedRequest.getCurrentApproverUserId()).ifPresent(recipients::add);
        }
        List<User> hrAdmins = userRepository.findActiveUsersByRole(com.example.multi_tanent.master.enums.Role.HRMS_ADMIN);
        List<User> superAdmins = userRepository.findActiveUsersByRole(com.example.multi_tanent.master.enums.Role.SUPER_ADMIN);
        if (hrAdmins != null) recipients.addAll(hrAdmins);
        if (superAdmins != null) recipients.addAll(superAdmins);

        for (User recipient : recipients) {
            notificationService.sendWithTenant(
                tenantId,
                recipient.getId(),
                NotificationType.LEAVE_REQUEST_CANCELLED,
                "Leave Request Cancelled",
                cancelMsg,
                "/leave",
                savedRequest.getId(),
                "LEAVE_REQUEST",
                NotificationPriority.LOW
            );
        }

        return LeaveRequestResponseDto.fromEntity(savedRequest);
    }

    private LeaveBalance getLatestLeaveBalance(Long employeeId, Long leaveTypeId) {
        return leaveBalanceRepository.findFirstByEmployeeIdAndLeaveTypeIdOrderByAsOfDateDesc(employeeId, leaveTypeId)
                .orElseThrow(() -> new RuntimeException("No leave balance found for employee and leave type. Please allocate leaves first."));
    }
}