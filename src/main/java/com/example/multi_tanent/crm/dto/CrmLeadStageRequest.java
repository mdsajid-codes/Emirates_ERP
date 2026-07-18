package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CrmLeadStageRequest {
    @NotBlank(message = "Stage name is required")
    private String name;

    private Integer sortOrder;
    private Boolean isDefault;

    private Long locationId; // Optional

    private com.example.multi_tanent.crm.enums.CrmStageMoveTo moveTo;
    private Boolean isConverted;
    private Boolean isWon;
    private Boolean isMql;
    private Boolean isSql;
    private Double probability;
    private Boolean assignTo;
}