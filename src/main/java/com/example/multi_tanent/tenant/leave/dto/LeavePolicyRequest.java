package com.example.multi_tanent.tenant.leave.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class LeavePolicyRequest {
    @NotBlank(message = "Policy name is required")
    private String name;
    private Boolean defaultPolicy;
    private String appliesToExpression;
    @Valid @NotEmpty
    private List<LeaveTypePolicyRequest> leaveTypePolicies;
}