package com.example.multi_tanent.tenant.leave.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.leave.dto.LeaveEncashmentProcessRequest;
import com.example.multi_tanent.tenant.leave.dto.LeaveEncashmentRequestDto;
import com.example.multi_tanent.tenant.leave.entity.LeaveBalance;
import com.example.multi_tanent.tenant.leave.entity.LeaveEncashmentRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveType;
import com.example.multi_tanent.tenant.leave.enums.ApprovalAction;
import com.example.multi_tanent.tenant.leave.enums.EncashmentStatus;
import com.example.multi_tanent.tenant.leave.repository.LeaveBalanceRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveEncashmentRequestRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveTypeRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(transactionManager = "tenantTx")
public class LeaveEncashmentService {

    private final LeaveEncashmentRequestRepository encashmentRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final UserRepository userRepository;

    public LeaveEncashmentService(LeaveEncashmentRequestRepository encashmentRepository,
                                  EmployeeRepository employeeRepository,
                                  LeaveTypeRepository leaveTypeRepository,
                                  LeaveBalanceRepository leaveBalanceRepository,
                                  UserRepository userRepository) {
        this.encashmentRepository = encashmentRepository;
        this.employeeRepository = employeeRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.userRepository = userRepository;
    }

    public LeaveEncashmentRequest createRequest(LeaveEncashmentRequestDto requestDto) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Current user not found."));

        Employee employee = employeeRepository.findByEmployeeCode(requestDto.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("Employee not found with code: " + requestDto.getEmployeeCode()));

        LeaveType leaveType = leaveTypeRepository.findByLeaveType(requestDto.getLeaveType())
                .orElseThrow(() -> new RuntimeException("Leave type '" + requestDto.getLeaveType() + "' not found."));

        LeaveBalance balance = getLatestLeaveBalance(employee.getId(), leaveType.getId());

        if (balance.getAvailable().compareTo(requestDto.getDaysToEncash()) < 0) {
            throw new IllegalStateException("Insufficient leave balance. Available: " + balance.getAvailable() + ", Requested: " + requestDto.getDaysToEncash());
        }

        LeaveEncashmentRequest request = new LeaveEncashmentRequest();
        request.setEmployee(employee);
        request.setLeaveType(leaveType);
        request.setDaysRequested(requestDto.getDaysToEncash());
        request.setStatus(EncashmentStatus.SUBMITTED);
        request.setRequestedAt(LocalDateTime.now());
        request.setRequestedByUserId(currentUser.getId());
        request.setAmountCalculated(BigDecimal.ZERO); // This can be calculated on approval

        return encashmentRepository.save(request);
    }

    public LeaveEncashmentRequest processRequest(LeaveEncashmentProcessRequest processRequest) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User processor = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("Processing user not found."));

        LeaveEncashmentRequest request = encashmentRepository.findById(processRequest.getEncashmentRequestId())
                .orElseThrow(() -> new RuntimeException("Leave encashment request not found with id: " + processRequest.getEncashmentRequestId()));

        if (request.getStatus() != EncashmentStatus.SUBMITTED) {
            throw new IllegalStateException("Request is not in a processable state. Current status: " + request.getStatus());
        }

        if (processRequest.getAction() == ApprovalAction.APPROVED) {
            request.setStatus(EncashmentStatus.APPROVED);
            // On approval, reduce the total allocated leaves as they are being paid out, not taken.
            // This effectively removes them from the employee's entitlement for the period.
            LeaveBalance balance = getLatestLeaveBalance(request.getEmployee().getId(), request.getLeaveType().getId());
            balance.setTotalAllocated(balance.getTotalAllocated().subtract(request.getDaysRequested()));
            leaveBalanceRepository.save(balance);
        } else if (processRequest.getAction() == ApprovalAction.REJECTED) {
            request.setStatus(EncashmentStatus.REJECTED);
        }

        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedByUserId(processor.getId());

        return encashmentRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<LeaveEncashmentRequest> getRequestsByEmployeeCode(String employeeCode) {
        return encashmentRepository.findByEmployeeEmployeeCode(employeeCode);
    }

    private LeaveBalance getLatestLeaveBalance(Long employeeId, Long leaveTypeId) {
        return leaveBalanceRepository.findFirstByEmployeeIdAndLeaveTypeIdOrderByAsOfDateDesc(employeeId, leaveTypeId)
                .orElseThrow(() -> new RuntimeException("No leave balance found for employee and leave type."));
    }
}