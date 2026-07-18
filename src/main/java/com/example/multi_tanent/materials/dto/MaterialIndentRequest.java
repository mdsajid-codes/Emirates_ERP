package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.enums.IndentStatus;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class MaterialIndentRequest {
    private LocalDate indentDate;
    private Long materialRequisitionId;
    private Long locationId;
    private Long employeeId;
    private Long departmentId;
    private com.example.multi_tanent.materials.enums.IndentApprovalStatus approvalStatus;
    private com.example.multi_tanent.materials.enums.CreatePoStatus createPoStatus;
    private Long approvedById;
    private java.time.OffsetDateTime approvedDate;
    private IndentStatus status;
    private String remarks;
    private List<MaterialIndentDetailRequest> details;
}
