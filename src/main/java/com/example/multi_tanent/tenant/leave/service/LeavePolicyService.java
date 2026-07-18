package com.example.multi_tanent.tenant.leave.service;

import com.example.multi_tanent.tenant.leave.dto.LeavePolicyRequest;
import com.example.multi_tanent.tenant.leave.dto.ApprovalLevelRequest;
import com.example.multi_tanent.tenant.leave.dto.LeaveTypePolicyRequest;
import com.example.multi_tanent.tenant.leave.entity.ApprovalLevel;
import com.example.multi_tanent.tenant.leave.entity.LeavePolicy;
import com.example.multi_tanent.tenant.leave.entity.LeaveType;
import com.example.multi_tanent.tenant.leave.entity.LeaveTypePolicy;
import com.example.multi_tanent.tenant.leave.repository.LeavePolicyRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveTypePolicyRepository;
import com.example.multi_tanent.tenant.leave.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(transactionManager = "tenantTx")
public class LeavePolicyService {

    private final LeavePolicyRepository leavePolicyRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveTypePolicyRepository leaveTypePolicyRepository;

    public LeavePolicyService(LeavePolicyRepository leavePolicyRepository,
                              LeaveTypeRepository leaveTypeRepository,
                              LeaveTypePolicyRepository leaveTypePolicyRepository) {
        this.leavePolicyRepository = leavePolicyRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.leaveTypePolicyRepository = leaveTypePolicyRepository;
    }

    public LeavePolicy createLeavePolicy(LeavePolicyRequest request) {
        leavePolicyRepository.findByName(request.getName()).ifPresent(p -> {
            throw new IllegalStateException("Leave policy with name '" + request.getName() + "' already exists.");
        });

        // If this policy is set as default, unset any other default policy.
        if (Boolean.TRUE.equals(request.getDefaultPolicy())) {
            unsetCurrentDefaultPolicy();
        }

        LeavePolicy policy = new LeavePolicy();
        policy.setName(request.getName());
        policy.setDefaultPolicy(request.getDefaultPolicy());
        policy.setAppliesToExpression(request.getAppliesToExpression());

        List<LeaveTypePolicy> leaveTypePolicies = request.getLeaveTypePolicies().stream()
                .map(ltpRequest -> convertToLeaveTypePolicy(ltpRequest, policy))
                .collect(Collectors.toList()); // Keep as list, the new setter will handle it.

        policy.setLeaveTypePolicies(leaveTypePolicies);

        return leavePolicyRepository.save(policy);
    }

    public LeavePolicy updateLeavePolicy(Long policyId, LeavePolicyRequest request) {
        LeavePolicy policy = leavePolicyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("LeavePolicy not found with id: " + policyId));

        // Check if name is being changed to one that already exists
        if (!policy.getName().equals(request.getName())) {
            leavePolicyRepository.findByName(request.getName()).ifPresent(p -> {
                throw new IllegalStateException("Leave policy with name '" + request.getName() + "' already exists.");
            });
        }

        // If this policy is being set as default, unset the current one.
        if (Boolean.TRUE.equals(request.getDefaultPolicy()) && !Boolean.TRUE.equals(policy.getDefaultPolicy())) {
            unsetCurrentDefaultPolicy();
        }

        policy.setName(request.getName());
        policy.setDefaultPolicy(request.getDefaultPolicy());
        policy.setAppliesToExpression(request.getAppliesToExpression());

        // Note: This update does not modify the nested LeaveTypePolicies.
        // That should be done via the LeaveTypePolicyController endpoints.
        return leavePolicyRepository.save(policy);
    }

    private LeaveTypePolicy convertToLeaveTypePolicy(LeaveTypePolicyRequest request, LeavePolicy policy) {
        LeaveType leaveType = leaveTypeRepository.findById(request.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("LeaveType not found with id: " + request.getLeaveTypeId()));

        LeaveTypePolicy ltp = new LeaveTypePolicy();
        ltp.setPolicy(policy);
        ltp.setLeaveType(leaveType);
        updateLeaveTypePolicyFromRequest(ltp, request);
        return ltp;
    }

    @Transactional(readOnly = true)
    public List<LeavePolicy> getAllLeavePolicies() {
        return leavePolicyRepository.findAllWithDetails(); // This now fetches all nested collections
    }

    @Transactional(readOnly = true)
    public List<LeaveTypePolicy> getAllLeaveTypePolicies() {
        return leaveTypePolicyRepository.findAll();
    }

    public LeaveTypePolicy addLeaveTypePolicyToPolicy(Long policyId, LeaveTypePolicyRequest request) {
        LeavePolicy policy = leavePolicyRepository.findById(policyId)
                .orElseThrow(() -> new RuntimeException("LeavePolicy not found with id: " + policyId));

        // Ensure this leave type isn't already in the policy
        boolean exists = policy.getLeaveTypePolicies().stream()
                .anyMatch(ltp -> ltp.getLeaveType().getId().equals(request.getLeaveTypeId()));
        if (exists) {
            throw new IllegalStateException("LeaveType with ID " + request.getLeaveTypeId() + " already exists in this policy.");
        }

        LeaveTypePolicy ltp = convertToLeaveTypePolicy(request, policy);
        return leaveTypePolicyRepository.save(ltp);
    }

    public LeaveTypePolicy updateLeaveTypePolicy(Long leaveTypePolicyId, LeaveTypePolicyRequest request) {
        LeaveTypePolicy ltp = leaveTypePolicyRepository.findById(leaveTypePolicyId)
                .orElseThrow(() -> new RuntimeException("LeaveTypePolicy not found with id: " + leaveTypePolicyId));

        // Ensure the leave type itself is not being changed, which is a complex operation.
        if (!ltp.getLeaveType().getId().equals(request.getLeaveTypeId())) {
            throw new IllegalArgumentException("Changing the LeaveType of an existing policy rule is not allowed. Delete and re-create instead.");
        }

        updateLeaveTypePolicyFromRequest(ltp, request);
        return leaveTypePolicyRepository.save(ltp);
    }

    /**
     * Helper method to map all fields from a request DTO to a LeaveTypePolicy entity.
     * This is used for both creating and updating.
     *
     * @param ltp The entity to update.
     * @param request The request DTO with new data.
     */
    private void updateLeaveTypePolicyFromRequest(LeaveTypePolicy ltp, LeaveTypePolicyRequest request) {
        ltp.setQuotaLimitType(request.getQuotaLimitType());
        ltp.setQuotaDays(request.getQuotaDays());
        ltp.setMidYearJoinProratePolicy(request.getMidYearJoinProratePolicy());
        ltp.setJoinMonthCutoffDay(request.getJoinMonthCutoffDay());

        ltp.setAccrualType(request.getAccrualType());
        ltp.setAccrualInterval(request.getAccrualInterval());
        ltp.setAccrualAmountDays(request.getAccrualAmountDays());

        ltp.setRoundingPolicy(request.getRoundingPolicy());
        ltp.setApplicationSettings(request.getApplicationSettings());
        ltp.setRestrictionSettings(request.getRestrictionSettings());
        ltp.setSandwichRules(request.getSandwichRules());
        ltp.setApprovalFlow(request.getApprovalFlow());
        ltp.setYearEndProcessing(request.getYearEndProcessing());
        ltp.setAnnualEntitlementRules(request.getAnnualEntitlementRules());

        // Clear existing levels and rebuild them to handle updates, additions, and removals.
        ltp.getApprovalLevels().clear();
        if (request.getApprovalLevels() != null) {
            List<ApprovalLevel> newApprovalLevels = request.getApprovalLevels().stream()
                    .map(alRequest -> convertToApprovalLevel(alRequest, ltp))
                    .collect(Collectors.toList());
            ltp.getApprovalLevels().addAll(newApprovalLevels);
        }
    }

    private ApprovalLevel convertToApprovalLevel(ApprovalLevelRequest alRequest, LeaveTypePolicy ltp) {
        ApprovalLevel al = new ApprovalLevel();
        al.setLeaveTypePolicy(ltp);
        al.setLevelOrder(alRequest.getLevelOrder());
        al.setSelectionMode(alRequest.getSelectionMode());
        al.setRoleKey(alRequest.getRoleKey());
        al.setEmployeeId(alRequest.getEmployeeId());
        return al;
    }

    private void unsetCurrentDefaultPolicy() {
        leavePolicyRepository.findByDefaultPolicyTrue().ifPresent(currentDefault -> {
            currentDefault.setDefaultPolicy(false);
            leavePolicyRepository.save(currentDefault);
        });
    }

    public void deleteLeaveTypePolicy(Long leaveTypePolicyId) {
        leaveTypePolicyRepository.deleteById(leaveTypePolicyId);
    }

    public void deleteLeavePolicy(Long policyId) {
        if (!leavePolicyRepository.existsById(policyId)) {
            throw new RuntimeException("LeavePolicy not found with id: " + policyId);
        }
        leavePolicyRepository.deleteById(policyId);
    }
}