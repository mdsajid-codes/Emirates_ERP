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

    public LeaveRequestService(LeaveRequestRepository leaveRequestRepository,
                               EmployeeRepository employeeRepository,
                               LeaveTypeRepository leaveTypeRepository,
                               LeaveBalanceRepository leaveBalanceRepository,
                               UserRepository userRepository) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.employeeRepository = employeeRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.userRepository = userRepository;
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
        return LeaveRequestResponseDto.fromEntity(savedRequest);
    }

    private LeaveBalance getLatestLeaveBalance(Long employeeId, Long leaveTypeId) {
        return leaveBalanceRepository.findFirstByEmployeeIdAndLeaveTypeIdOrderByAsOfDateDesc(employeeId, leaveTypeId)
                .orElseThrow(() -> new RuntimeException("No leave balance found for employee and leave type. Please allocate leaves first."));
    }
}