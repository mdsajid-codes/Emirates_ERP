package com.example.multi_tanent.tenant.leave.dto;

import com.example.multi_tanent.tenant.leave.entity.*;
import com.example.multi_tanent.tenant.leave.enums.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class LeaveTypePolicyRequest {
    @NotNull(message = "Leave Type ID is required")
    private Long leaveTypeId;
    @NotNull
    private AnnualQuotaLimitType quotaLimitType;

    private Integer quotaDays;

    private MidYearJoinProratePolicy midYearJoinProratePolicy;

    private Integer joinMonthCutoffDay;

    @NotNull
    private AccrualType accrualType;

    private AccrualInterval accrualInterval;

    private Double accrualAmountDays;

    @NotNull
    private RoundingPolicy roundingPolicy;

    @Valid
    private ApplicationSettings applicationSettings;
    @Valid
    private RestrictionSettings restrictionSettings;
    @Valid
    private SandwichRules sandwichRules;
    @Valid
    private ApprovalFlow approvalFlow;
    @Valid
    private List<ApprovalLevelRequest> approvalLevels;
    @Valid
    private YearEndProcessing yearEndProcessing;
    @Valid
    private AnnualEntitlementRules annualEntitlementRules;
}