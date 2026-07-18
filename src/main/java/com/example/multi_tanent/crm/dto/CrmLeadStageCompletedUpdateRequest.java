package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrmLeadStageCompletedUpdateRequest {

    @NotNull(message = "isCompleted status cannot be null")
    private Boolean isCompleted;
}