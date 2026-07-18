package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.enums.IndentApprovalStatus;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class IndentApprovalRequest {
    private IndentApprovalStatus approvalStatus;
    private Long approvedById;
    private OffsetDateTime approvedDate;
}
