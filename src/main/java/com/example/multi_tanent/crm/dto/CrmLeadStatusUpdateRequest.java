package com.example.multi_tanent.crm.dto;

import com.example.multi_tanent.crm.enums.CrmLeadStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CrmLeadStatusUpdateRequest {

    @NotNull(message = "Status cannot be null")
    private CrmLeadStatus status;
}