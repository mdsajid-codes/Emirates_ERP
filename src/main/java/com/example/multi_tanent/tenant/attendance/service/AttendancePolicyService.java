package com.example.multi_tanent.tenant.attendance.service;

import com.example.multi_tanent.tenant.attendance.dto.AttendancePolicyRequest;
import com.example.multi_tanent.tenant.attendance.dto.AttendancePolicyResponse;
import com.example.multi_tanent.tenant.attendance.entity.AttendanceCapturingPolicy;
import com.example.multi_tanent.tenant.attendance.entity.AttendancePolicy;
import com.example.multi_tanent.tenant.attendance.entity.LeaveDeductionConfig;
import com.example.multi_tanent.tenant.attendance.entity.ShiftPolicy;
import com.example.multi_tanent.tenant.attendance.repository.AttendanceCapturingPolicyRepository;
import com.example.multi_tanent.tenant.attendance.repository.AttendancePolicyRepository;
import com.example.multi_tanent.tenant.attendance.repository.ShiftPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(transactionManager = "tenantTx")
public class AttendancePolicyService {

    private final AttendancePolicyRepository attendancePolicyRepository;
    private final ShiftPolicyRepository shiftPolicyRepository;
    private final AttendanceCapturingPolicyRepository capturingPolicyRepository;
    private final TenantModuleChecker moduleChecker;

    public AttendancePolicyService(AttendancePolicyRepository attendancePolicyRepository,
                                   ShiftPolicyRepository shiftPolicyRepository,
                                   AttendanceCapturingPolicyRepository capturingPolicyRepository,
                                   TenantModuleChecker moduleChecker) {
        this.attendancePolicyRepository = attendancePolicyRepository;
        this.shiftPolicyRepository = shiftPolicyRepository;
        this.capturingPolicyRepository = capturingPolicyRepository;
        this.moduleChecker = moduleChecker;
    }

    public AttendancePolicyResponse createPolicy(AttendancePolicyRequest request) {
        attendancePolicyRepository.findByPolicyName(request.getPolicyName()).ifPresent(p -> {
            throw new RuntimeException("Attendance policy with name '" + request.getPolicyName() + "' already exists.");
        });

        ShiftPolicy shiftPolicy = shiftPolicyRepository.findById(request.getShiftPolicyId())
                .orElseThrow(() -> new RuntimeException("ShiftPolicy not found with id: " + request.getShiftPolicyId()));
        AttendanceCapturingPolicy capturingPolicy = capturingPolicyRepository.findById(request.getCapturingPolicyId())
                .orElseThrow(() -> new RuntimeException("AttendanceCapturingPolicy not found with id: " + request.getCapturingPolicyId()));

        AttendancePolicy policy = new AttendancePolicy();
        policy.setPolicyName(request.getPolicyName());
        policy.setIsDefault(request.getIsDefault());
        policy.setEffectiveFrom(request.getEffectiveFrom());
        policy.setShiftPolicy(shiftPolicy);
        policy.setCapturingPolicy(capturingPolicy);

        if (request.getLeaveDeductionConfig() != null) {
            LeaveDeductionConfig deductionConfig = new LeaveDeductionConfig();
            deductionConfig.setDeductForMissingSwipes(request.getLeaveDeductionConfig().getDeductForMissingSwipes());
            deductionConfig.setDeductForWorkHoursShortage(request.getLeaveDeductionConfig().getDeductForWorkHoursShortage());
            deductionConfig.setDeductMissingAttendance(request.getLeaveDeductionConfig().getDeductMissingAttendance());
            deductionConfig.setPenalizeEarlyGoing(request.getLeaveDeductionConfig().getPenalizeEarlyGoing());
            deductionConfig.setPenalizeLateArrival(request.getLeaveDeductionConfig().getPenalizeLateArrival());
            deductionConfig.setPolicy(policy);
            policy.setLeaveDeductionConfig(deductionConfig);
        }

        AttendancePolicy savedPolicy = attendancePolicyRepository.save(policy);
        return AttendancePolicyResponse.fromEntity(savedPolicy);
    }

    @Transactional(readOnly = true)
    public List<AttendancePolicyResponse> getAllPolicies() {
        if (!moduleChecker.hasModule(ServiceModule.HRMS_ATTENDANCE)) {
            return java.util.Collections.emptyList();
        }
        return attendancePolicyRepository.findAllWithDetails().stream()
                .map(AttendancePolicyResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AttendancePolicyResponse> getPolicyById(Long id) {
        return attendancePolicyRepository.findById(id)
                .map(AttendancePolicyResponse::fromEntity);
    }

    public AttendancePolicyResponse updatePolicy(Long id, AttendancePolicyRequest request) {
        AttendancePolicy policy = attendancePolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("AttendancePolicy not found with id: " + id));

        // Check if name is being changed to one that already exists
        if (!policy.getPolicyName().equals(request.getPolicyName())) {
            attendancePolicyRepository.findByPolicyName(request.getPolicyName()).ifPresent(p -> {
                throw new RuntimeException("Attendance policy with name '" + request.getPolicyName() + "' already exists.");
            });
        }

        ShiftPolicy shiftPolicy = shiftPolicyRepository.findById(request.getShiftPolicyId())
                .orElseThrow(() -> new RuntimeException("ShiftPolicy not found with id: " + request.getShiftPolicyId()));
        AttendanceCapturingPolicy capturingPolicy = capturingPolicyRepository.findById(request.getCapturingPolicyId())
                .orElseThrow(() -> new RuntimeException("AttendanceCapturingPolicy not found with id: " + request.getCapturingPolicyId()));

        policy.setPolicyName(request.getPolicyName());
        policy.setIsDefault(request.getIsDefault());
        policy.setEffectiveFrom(request.getEffectiveFrom());
        policy.setShiftPolicy(shiftPolicy);
        policy.setCapturingPolicy(capturingPolicy);

        // For simplicity, we replace the deduction config. A more complex update could merge them.
        if (policy.getLeaveDeductionConfig() != null) {
            policy.getLeaveDeductionConfig().setPolicy(null);
        }
        policy.setLeaveDeductionConfig(null);
        // Then re-create it if present in the request, similar to the create method.
        // This part can be enhanced if partial updates are needed.

        AttendancePolicy savedPolicy = attendancePolicyRepository.save(policy);
        return AttendancePolicyResponse.fromEntity(savedPolicy);
    }

    public void deletePolicy(Long id) {
        if (!attendancePolicyRepository.existsById(id)) {
            throw new RuntimeException("AttendancePolicy not found with id: " + id);
        }
        attendancePolicyRepository.deleteById(id);
    }
}