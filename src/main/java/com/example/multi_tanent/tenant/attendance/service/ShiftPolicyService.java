package com.example.multi_tanent.tenant.attendance.service;

import com.example.multi_tanent.tenant.attendance.dto.ShiftPolicyResponse;
import com.example.multi_tanent.tenant.attendance.dto.ShiftPolicyRequest;
import com.example.multi_tanent.tenant.attendance.entity.ShiftPolicy;
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
public class ShiftPolicyService {

    private final ShiftPolicyRepository shiftPolicyRepository;
    private final TenantModuleChecker moduleChecker;

    public ShiftPolicyService(ShiftPolicyRepository shiftPolicyRepository, TenantModuleChecker moduleChecker) {
        this.shiftPolicyRepository = shiftPolicyRepository;
        this.moduleChecker = moduleChecker;
    }

    public ShiftPolicyResponse createShiftPolicy(ShiftPolicyRequest request) {
        shiftPolicyRepository.findByPolicyName(request.getPolicyName()).ifPresent(p -> {
            throw new RuntimeException("Shift policy with name '" + request.getPolicyName() + "' already exists.");
        });

        // If this policy is being set as the default, unset any other default policy.
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            shiftPolicyRepository.findByIsDefaultTrue().ifPresent(defaultPolicy -> {
                defaultPolicy.setIsDefault(false);
                shiftPolicyRepository.save(defaultPolicy);
            });
        }

        ShiftPolicy policy = new ShiftPolicy();
        policy.setPolicyName(request.getPolicyName());
        policy.setShiftStartTime(request.getShiftStartTime());
        policy.setShiftEndTime(request.getShiftEndTime());
        policy.setIsDefault(request.getIsDefault());
        policy.setDescription(request.getDescription());
        policy.setBreakMinutes(request.getBreakMinutes() != null ? request.getBreakMinutes() : 0);
        policy.setIsNightShift(request.getIsNightShift() != null ? request.getIsNightShift() : false);

        ShiftPolicy savedPolicy = shiftPolicyRepository.save(policy);
        return ShiftPolicyResponse.fromEntity(savedPolicy);
    }

    @Transactional(readOnly = true)
    public List<ShiftPolicyResponse> getAllShiftPolicies() {
        if (!moduleChecker.hasModule(ServiceModule.HRMS_ATTENDANCE)) {
            return List.of();
        }
        return shiftPolicyRepository.findAll().stream()
                .map(ShiftPolicyResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<ShiftPolicyResponse> getShiftPolicyById(Long id) {
        return shiftPolicyRepository.findById(id)
                .map(ShiftPolicyResponse::fromEntity);
    }

    public ShiftPolicyResponse updateShiftPolicy(Long id, ShiftPolicyRequest request) {
        ShiftPolicy policy = shiftPolicyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Shift policy not found with id: " + id));

        // Check if name is being changed to one that already exists
        if (!policy.getPolicyName().equals(request.getPolicyName())) {
            shiftPolicyRepository.findByPolicyName(request.getPolicyName()).ifPresent(p -> {
                throw new RuntimeException("Shift policy with name '" + request.getPolicyName() + "' already exists.");
            });
        }

        // If this policy is being set as the default, unset any other default policy.
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            shiftPolicyRepository.findByIsDefaultTrue().ifPresent(defaultPolicy -> {
                // if (!defaultPolicy.getId().equals(id)) {
                    defaultPolicy.setIsDefault(false);
                    shiftPolicyRepository.save(defaultPolicy);
                // }
            });
        }

        policy.setPolicyName(request.getPolicyName());
        policy.setShiftStartTime(request.getShiftStartTime());
        policy.setShiftEndTime(request.getShiftEndTime());
        policy.setIsDefault(request.getIsDefault());
        policy.setDescription(request.getDescription());
        policy.setBreakMinutes(request.getBreakMinutes() != null ? request.getBreakMinutes() : 0);
        policy.setIsNightShift(request.getIsNightShift() != null ? request.getIsNightShift() : false);

        ShiftPolicy savedPolicy = shiftPolicyRepository.save(policy);
        return ShiftPolicyResponse.fromEntity(savedPolicy);
    }

    public void deleteShiftPolicy(Long id) {
        if (!shiftPolicyRepository.existsById(id)) {
            throw new RuntimeException("Shift policy not found with id: " + id);
        }
        shiftPolicyRepository.deleteById(id);
    }
}
