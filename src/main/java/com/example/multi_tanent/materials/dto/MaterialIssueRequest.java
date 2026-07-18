package com.example.multi_tanent.materials.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class MaterialIssueRequest {
    private LocalDate issueDate;
    private Long materialRequisitionId;
    private String remarks;
    private List<MaterialIssueDetailRequest> details;
}
