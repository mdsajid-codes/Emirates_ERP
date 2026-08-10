package com.example.multi_tanent.tenant.leave.service;

import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.leave.dto.LeaveRequestResponseDto;
import com.example.multi_tanent.tenant.leave.dto.LeaveApprovalRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveApproval;
import com.example.multi_tanent.tenant.leave.entity.LeaveBalance;
import com.example.multi_tanent.tenant.leave.entity.LeaveRequest;
import com.example.multi_tanent.tenant.leave.enums.ApprovalAction;
import com.example.multi_tanent.tenant.leave.enums.LeaveStatus;
import com.example.multi_tanent.tenant.leave.repository.LeaveApprovalRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveBalanceRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveRequestRepository;
import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.service.NotificationService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(transactionManager = "tenantTx")
public class LeaveApprovalService {

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveApprovalRepository leaveApprovalRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public LeaveApprovalService(LeaveRequestRepository leaveRequestRepository,
                                LeaveApprovalRepository leaveApprovalRepository,
                                LeaveBalanceRepository leaveBalanceRepository,
                                UserRepository userRepository,
                                NotificationService notificationService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveApprovalRepository = leaveApprovalRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public LeaveRequestResponseDto processApproval(LeaveApprovalRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User approver = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Approver user not found in security context."));

        LeaveRequest leaveRequest = leaveRequestRepository.findById(request.getLeaveRequestId())
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + request.getLeaveRequestId()));

        if (leaveRequest.getStatus() != LeaveStatus.SUBMITTED) {
            throw new IllegalStateException("Leave request is not in SUBMITTED state. Current state: " + leaveRequest.getStatus());
        }

        LeaveApproval approval = new LeaveApproval();
        approval.setLeaveRequest(leaveRequest);
        approval.setApproverUserId(approver.getId());
        approval.setAction(request.getAction());
        approval.setComment(request.getComment());
        approval.setActionAt(LocalDateTime.now());
        leaveApprovalRepository.save(approval);

        String tenantId = com.example.multi_tanent.config.TenantContext.getTenantId();

        if (request.getAction() == ApprovalAction.APPROVED) {
            leaveRequest.setStatus(LeaveStatus.APPROVED);
            leaveRequest.setDaysApproved(leaveRequest.getDaysRequested());
            updateLeaveBalanceOnApproval(leaveRequest, tenantId);

            if (leaveRequest.getEmployee() != null && leaveRequest.getEmployee().getUser() != null) {
                Long employeeUserId = leaveRequest.getEmployee().getUser().getId();
                notificationService.sendWithTenant(
                    tenantId,
                    employeeUserId,
                    NotificationType.LEAVE_REQUEST_APPROVED,
                    "Leave Request Approved",
                    "Your " + leaveRequest.getLeaveType().getLeaveType() +
                        " leave request from " + leaveRequest.getFromDate() +
                        " to " + leaveRequest.getToDate() + " has been approved." +
                        (request.getComment() != null && !request.getComment().isBlank()
                            ? " Note: " + request.getComment() : ""),
                    "/leave",
                    leaveRequest.getId(),
                    "LEAVE_REQUEST",
                    NotificationPriority.HIGH
                );
            }
        } else if (request.getAction() == ApprovalAction.REJECTED) {
            leaveRequest.setStatus(LeaveStatus.REJECTED);
            updateLeaveBalanceOnRejection(leaveRequest);

            if (leaveRequest.getEmployee() != null && leaveRequest.getEmployee().getUser() != null) {
                Long employeeUserId = leaveRequest.getEmployee().getUser().getId();
                notificationService.sendWithTenant(
                    tenantId,
                    employeeUserId,
                    NotificationType.LEAVE_REQUEST_REJECTED,
                    "Leave Request Rejected",
                    "Your " + leaveRequest.getLeaveType().getLeaveType() +
                        " leave request from " + leaveRequest.getFromDate() +
                        " to " + leaveRequest.getToDate() + " has been rejected." +
                        (request.getComment() != null && !request.getComment().isBlank()
                            ? " Reason: " + request.getComment() : " Please contact HR for more details."),
                    "/leave",
                    leaveRequest.getId(),
                    "LEAVE_REQUEST",
                    NotificationPriority.HIGH
                );
            }
        }

        leaveRequest.setUpdatedAt(LocalDateTime.now());
        leaveRequest.setUpdatedByUserId(approver.getId());

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);
        return LeaveRequestResponseDto.fromEntity(savedRequest);
    }

    private void updateLeaveBalanceOnApproval(LeaveRequest leaveRequest, String tenantId) {
        // On approval, days move from 'pending' to 'used'.
        LeaveBalance balance = getLatestLeaveBalance(leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType().getId());
        BigDecimal daysApproved = leaveRequest.getDaysApproved(); // Use approved days

        balance.setPending(balance.getPending().subtract(leaveRequest.getDaysRequested())); // Reduce pending by original requested amount
        balance.setUsed(balance.getUsed().add(daysApproved)); // Increase used by the approved amount
        balance.setUpdatedAt(LocalDateTime.now());
        leaveBalanceRepository.save(balance);

        // 1.9 LEAVE_BALANCE_LOW check: if remaining balance (allocated - used - pending) < 2.0 days
        BigDecimal allocated = balance.getTotalAllocated() != null ? balance.getTotalAllocated() : BigDecimal.ZERO;
        BigDecimal remaining = allocated.subtract(balance.getUsed()).subtract(balance.getPending());
        if (remaining.compareTo(new BigDecimal("2.0")) < 0 && leaveRequest.getEmployee() != null && leaveRequest.getEmployee().getUser() != null) {
            notificationService.sendWithTenant(
                tenantId,
                leaveRequest.getEmployee().getUser().getId(),
                NotificationType.LEAVE_BALANCE_LOW,
                "Low Leave Balance Warning",
                "You have less than 2 days of " + leaveRequest.getLeaveType().getLeaveType() + " leave remaining (" + remaining + " days).",
                "/leave",
                balance.getId(),
                "LEAVE_BALANCE",
                NotificationPriority.HIGH
            );
        }
    }

    private void updateLeaveBalanceOnRejection(LeaveRequest leaveRequest) {
        // On rejection, 'pending' days are simply returned to the available pool.
        LeaveBalance balance = getLatestLeaveBalance(leaveRequest.getEmployee().getId(), leaveRequest.getLeaveType().getId());

        balance.setPending(balance.getPending().subtract(leaveRequest.getDaysRequested()));
        balance.setUpdatedAt(LocalDateTime.now());
        // Note: No change to 'used' or 'totalAllocated' fields.
        leaveBalanceRepository.save(balance);
    }

    private LeaveBalance getLatestLeaveBalance(Long employeeId, Long leaveTypeId) {
        return leaveBalanceRepository.findFirstByEmployeeIdAndLeaveTypeIdOrderByAsOfDateDesc(employeeId, leaveTypeId)
                .orElseThrow(() -> new RuntimeException("No leave balance found for employee and leave type."));
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponseDto> getPendingApprovalsForCurrentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Current user not found."));
        List<LeaveRequest> requests = leaveRequestRepository.findByCurrentApproverUserIdAndStatus(currentUser.getId(), LeaveStatus.SUBMITTED);
        return requests.stream()
                .map(LeaveRequestResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
}