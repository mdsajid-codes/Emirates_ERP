package com.example.multi_tanent.tenant.leave.dto;

import com.example.multi_tanent.tenant.leave.enums.ApprovalAction;
import lombok.Data;

@Data
public class LeaveApprovalRequest {
    private Long leaveRequestId;
    private ApprovalAction action;
    private String comment;
}