package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.entity.MaterialIndent;
import com.example.multi_tanent.materials.enums.IndentStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class MaterialIndentResponse {
        private Long id;
        private String indentNo;
        private LocalDate indentDate;
        private Long materialRequisitionId;
        private String materialRequisitionNo;
        private Long locationId;
        private String locationName;
        private Long employeeId;
        private String employeeName;
        private Long departmentId;
        private String departmentName;
        private com.example.multi_tanent.materials.enums.IndentApprovalStatus approvalStatus;
        private com.example.multi_tanent.materials.enums.CreatePoStatus createPoStatus;
        private Long approvedById;
        private String approvedByName;
        private java.time.OffsetDateTime approvedDate;
        private IndentStatus status;
        private String remarks;
        private List<MaterialIndentDetailResponse> details;
        private OffsetDateTime createdAt;
        private OffsetDateTime updatedAt;

        public static MaterialIndentResponse fromEntity(MaterialIndent entity) {
                return MaterialIndentResponse.builder()
                                .id(entity.getId())
                                .indentNo(entity.getIndentNo())
                                .indentDate(entity.getIndentDate())
                                .materialRequisitionId(
                                                entity.getMaterialRequisition() != null
                                                                ? entity.getMaterialRequisition().getId()
                                                                : null)
                                .materialRequisitionNo(
                                                entity.getMaterialRequisition() != null
                                                                ? entity.getMaterialRequisition().getRequestNo()
                                                                : null)
                                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                                .employeeId(entity.getEmployee() != null ? entity.getEmployee().getId() : null)
                                .employeeName(entity.getEmployee() != null ? entity.getEmployee().getFirstName() + " "
                                                + entity.getEmployee().getLastName() : null)
                                .departmentId(entity.getDepartment() != null ? entity.getDepartment().getId() : null)
                                .departmentName(entity.getDepartment() != null ? entity.getDepartment().getName()
                                                : null)
                                .approvalStatus(entity.getApprovalStatus())
                                .createPoStatus(entity.getCreatePoStatus())
                                .approvedById(entity.getApprovedBy() != null ? entity.getApprovedBy().getId() : null)
                                .approvedByName(entity.getApprovedBy() != null ? entity.getApprovedBy().getName()
                                                : null)
                                .approvedDate(entity.getApprovedDate())
                                .status(entity.getStatus())
                                .remarks(entity.getRemarks())
                                .details(entity.getDetails() != null ? entity.getDetails().stream()
                                                .map(MaterialIndentDetailResponse::fromEntity)
                                                .collect(Collectors.toList()) : null)
                                .createdAt(entity.getCreatedAt())
                                .updatedAt(entity.getUpdatedAt())
                                .build();
        }
}
