package com.example.multi_tanent.tenant.leave.dto;

import com.example.multi_tanent.tenant.leave.enums.ApproverSelectionMode;
import lombok.Data;

@Data
public class ApprovalLevelRequest {
    private int levelOrder;
    private ApproverSelectionMode selectionMode;
    private String roleKey;
    private Long employeeId;
}