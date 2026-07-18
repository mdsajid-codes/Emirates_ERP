package com.example.multi_tanent.tenant.attendance.service;

import com.example.multi_tanent.tenant.attendance.dto.AttendanceCapturingPolicyRequest;
import com.example.multi_tanent.tenant.attendance.dto.AttendanceCapturingPolicyResponse;
import com.example.multi_tanent.tenant.attendance.entity.AttendanceCapturingPolicy;
import com.example.multi_tanent.tenant.attendance.repository.AttendanceCapturingPolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.multi_tanent.master.entity.ServiceModule;
import com.example.multi_tanent.master.service.TenantModuleChecker;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(transactionManager = "tenantTx")
public class AttendanceCapturingPolicyService {

    private final AttendanceCapturingPolicyRepository repository;
    private final TenantModuleChecker moduleChecker;

    public AttendanceCapturingPolicyService(AttendanceCapturingPolicyRepository repository, TenantModuleChecker moduleChecker) {
        this.repository = repository;
        this.moduleChecker = moduleChecker;
    }

    public AttendanceCapturingPolicyResponse createPolicy(AttendanceCapturingPolicyRequest request) {
        repository.findByPolicyName(request.getPolicyName()).ifPresent(p -> {
            throw new RuntimeException("Policy with name '" + request.getPolicyName() + "' already exists.");
        });
        AttendanceCapturingPolicy policy = mapRequestToEntity(new AttendanceCapturingPolicy(), request);
        AttendanceCapturingPolicy savedPolicy = repository.save(policy);
        return AttendanceCapturingPolicyResponse.fromEntity(savedPolicy);
    }

    @Transactional(readOnly = true)
    public List<AttendanceCapturingPolicyResponse> getAllPolicies() {
        if (!moduleChecker.hasModule(ServiceModule.HRMS_ATTENDANCE)) {
            return List.of();
        }
        return repository.findAll().stream()
                .map(AttendanceCapturingPolicyResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<AttendanceCapturingPolicyResponse> getPolicyById(Long id) {
        return repository.findById(id)
                .map(AttendanceCapturingPolicyResponse::fromEntity);
    }

    public AttendanceCapturingPolicyResponse updatePolicy(Long id, AttendanceCapturingPolicyRequest request) {
        AttendanceCapturingPolicy policy = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Policy not found with id: " + id));
        policy = mapRequestToEntity(policy, request);
        AttendanceCapturingPolicy savedPolicy = repository.save(policy);
        return AttendanceCapturingPolicyResponse.fromEntity(savedPolicy);
    }

    public void deletePolicy(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Policy not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private AttendanceCapturingPolicy mapRequestToEntity(AttendanceCapturingPolicy policy, AttendanceCapturingPolicyRequest request) {
        policy.setPolicyName(request.getPolicyName());
        policy.setGraceTimeMinutes(request.getGraceTimeMinutes());
        policy.setHalfDayThresholdMinutes(request.getHalfDayThresholdMinutes());
        policy.setAllowMultiplePunches(request.getAllowMultiplePunches());
        policy.setLateMarkRules(request.getLateMarkRules());
        return policy;
    }
}