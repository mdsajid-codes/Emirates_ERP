package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class BulkAssignOwnerRequest {

    @NotEmpty(message = "Lead IDs cannot be empty")
    private List<Long> leadIds;

    @NotNull(message = "Owner ID must be provided")
    private Long ownerId;
}
