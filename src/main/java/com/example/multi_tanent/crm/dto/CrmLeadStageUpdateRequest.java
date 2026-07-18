package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrmLeadStageUpdateRequest {

    @NotNull(message = "Stage ID cannot be null")
    private Long stageId;
}