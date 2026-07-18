package com.example.multi_tanent.tenant.leave.service;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.leave.dto.LeaveAllocationRequest;
import com.example.multi_tanent.tenant.leave.entity.LeaveAllocation;
import com.example.multi_tanent.tenant.leave.entity.LeaveType;
import com.example.multi_tanent.tenant.leave.repository.LeaveAllocationRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional(transactionManager = "tenantTx")
public class LeaveAllocationService {

    private final LeaveAllocationRepository allocationRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveAllocationService(LeaveAllocationRepository allocationRepository,
                                  EmployeeRepository employeeRepository,
                                  LeaveTypeRepository leaveTypeRepository) {
        this.allocationRepository = allocationRepository;
        this.employeeRepository = employeeRepository;
        this.leaveTypeRepository = leaveTypeRepository;
    }

    public LeaveAllocation createAllocation(LeaveAllocationRequest request) {
        Employee employee = employeeRepository.findByEmployeeCode(request.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("Employee not found with code: " + request.getEmployeeCode()));

        LeaveType leaveType = leaveTypeRepository.findByLeaveType(request.getLeaveType())
                .orElseThrow(() -> new RuntimeException("Leave type '" + request.getLeaveType() + "' not found in database. Please create it first."));

        allocationRepository.findByEmployeeIdAndLeaveTypeIdAndPeriodStartAndPeriodEnd(
                employee.getId(), leaveType.getId(), request.getPeriodStart(), request.getPeriodEnd())
                .ifPresent(a -> {
                    throw new RuntimeException("Leave allocation for this employee, leave type, and period already exists.");
                });

        LeaveAllocation allocation = new LeaveAllocation();
        mapRequestToEntity(request, allocation, employee, leaveType);
        
        allocation.setCreatedAt(LocalDateTime.now());

        return allocationRepository.save(allocation);
    }

    @Transactional(readOnly = true)
    public List<LeaveAllocation> getAllocationsByEmployeeCode(String employeeCode) {
        return allocationRepository.findByEmployeeEmployeeCode(employeeCode);
    }

    public LeaveAllocation updateAllocation(Long id, LeaveAllocationRequest request) {
        LeaveAllocation allocation = allocationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave allocation not found with id: " + id));

        Employee employee = employeeRepository.findByEmployeeCode(request.getEmployeeCode())
                .orElseThrow(() -> new RuntimeException("Employee not found with code: " + request.getEmployeeCode()));

        LeaveType leaveType = leaveTypeRepository.findByLeaveType(request.getLeaveType())
                .orElseThrow(() -> new RuntimeException("Leave type '" + request.getLeaveType() + "' not found in database. Please create it first."));

        mapRequestToEntity(request, allocation, employee, leaveType);
        return allocationRepository.save(allocation);
    }

    public void deleteAllocation(Long id) {
        if (!allocationRepository.existsById(id)) {
            throw new RuntimeException("Leave allocation not found with id: " + id);
        }
        allocationRepository.deleteById(id);
    }

    private void mapRequestToEntity(LeaveAllocationRequest request, LeaveAllocation allocation, Employee employee, LeaveType leaveType) {
        allocation.setEmployee(employee);
        allocation.setLeaveType(leaveType);
        allocation.setAllocatedDays(request.getAllocatedDays());
        allocation.setPeriodStart(request.getPeriodStart());
        allocation.setPeriodEnd(request.getPeriodEnd());
        allocation.setSource(request.getSource());
    }
}