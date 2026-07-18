package com.example.multi_tanent.tenant.leave.dto;

import com.example.multi_tanent.tenant.leave.enums.ApprovalAction;
import lombok.Data;

@Data
public class LeaveEncashmentProcessRequest {
    private Long encashmentRequestId;
    private ApprovalAction action; // APPROVED or REJECTED
}