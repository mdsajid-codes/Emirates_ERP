package com.example.multi_tanent.materials.dto;

import com.example.multi_tanent.materials.entity.MaterialIssue;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
public class MaterialIssueResponse {
    private Long id;
    private String issueNo;
    private LocalDate issueDate;
    private Long materialRequisitionId;
    private String materialRequisitionNo;
    private String remarks;
    private List<MaterialIssueDetailResponse> details;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static MaterialIssueResponse fromEntity(MaterialIssue entity) {
        return MaterialIssueResponse.builder()
                .id(entity.getId())
                .issueNo(entity.getIssueNo())
                .issueDate(entity.getIssueDate())
                .materialRequisitionId(
                        entity.getMaterialRequisition() != null ? entity.getMaterialRequisition().getId() : null)
                .materialRequisitionNo(
                        entity.getMaterialRequisition() != null ? entity.getMaterialRequisition().getRequestNo() : null)
                .remarks(entity.getRemarks())
                .details(entity.getDetails() != null ? entity.getDetails().stream()
                        .map(MaterialIssueDetailResponse::fromEntity)
                        .collect(Collectors.toList()) : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
