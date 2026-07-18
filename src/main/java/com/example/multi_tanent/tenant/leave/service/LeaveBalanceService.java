package com.example.multi_tanent.tenant.leave.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.leave.dto.LeaveBalanceRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveBalance;
import com.example.multi_tanent.tenant.leave.entity.LeaveType;
import com.example.multi_tanent.tenant.leave.repository.LeaveBalanceRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Year;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(transactionManager = "tenantTx")
public class LeaveBalanceService {

    private final LeaveBalanceRepository balanceRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveBalanceService(LeaveBalanceRepository balanceRepository,
                               EmployeeRepository employeeRepository,
                               LeaveTypeRepository leaveTypeRepository) {
        this.balanceRepository = balanceRepository;
        this.employeeRepository = employeeRepository;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    public LeaveBalance createOrUpdateBalance(LeaveBalanceRequest request) {
        Employee employee = employeeRepository.findByEmployeeCode(request.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("Employee not found with code: " + request.getEmployeeCode()));

        LeaveType leaveType = leaveTypeRepository.findByLeaveType(request.getLeaveType())
                .orElseThrow(() -> new RuntimeException("Leave type '" + request.getLeaveType() + "' not found."));

        // Find existing balance for the same employee, type, and date to update it.
        LeaveBalance balance = balanceRepository.findByEmployeeIdAndLeaveTypeIdAndAsOfDate(
                employee.getId(), leaveType.getId(), request.getAsOfDate())
                .orElse(new LeaveBalance());

        mapRequestToEntity(request, balance, employee, leaveType);
        balance.setYear(Year.now().getValue());

        return balanceRepository.save(balance);
    }

    @Transactional(readOnly = true)
    public List<LeaveBalance> getBalancesByEmployeeCode(String employeeCode) {
        return balanceRepository.findByEmployeeEmployeeCode(employeeCode);
    }

    @Transactional(readOnly = true)
    public Optional<LeaveBalance> getBalanceById(Long id) {
        return balanceRepository.findById(id);
    }

    public void deleteBalance(Long id) {
        if (!balanceRepository.existsById(id)) {
            throw new RuntimeException("Leave balance not found with id: " + id);
        }
        balanceRepository.deleteById(id);
    }

    private void mapRequestToEntity(LeaveBalanceRequest request, LeaveBalance balance, Employee employee, LeaveType leaveType) {
        // For new entities, set the relationships
        if (balance.getId() == null) {
            balance.setEmployee(employee);
            balance.setLeaveType(leaveType);
            balance.setPending(BigDecimal.ZERO); // Default pending days to zero
            balance.setUsed(BigDecimal.ZERO); // Default used days to zero
        }
        
        if (request.getAllocatedDays() != null) {
            balance.setTotalAllocated(request.getAllocatedDays());
        } else if (balance.getId() == null && leaveType.getMaxDaysPerYear() != null) {
            // For new balances, if not specified in request, set from leave type default
            balance.setTotalAllocated(new BigDecimal(leaveType.getMaxDaysPerYear()));
        }
        
        balance.setAsOfDate(request.getAsOfDate());
        balance.setUpdatedAt(LocalDateTime.now());
        // In a real app, updatedByUserId would be set from the security context
        // For example:
        /*
        *  totalAllocated = 10
        *  used = 2
        *  pending = 1
        *  available = totalAllocated - used - pending
        * */


        // String username = SecurityContextHolder.getContext().getAuthentication().getName();
        // User user = userRepository.findByEmail(username).orElse(null);
        // if (user != null) balance.setUpdatedByUserId(user.getId());
    }
}