package com.example.multi_tanent.crm.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CrmTaskStageRequest {
    @NotBlank(message = "Status name is required")
    private String statusName; 
    private boolean completed;
    private boolean isDefault;
    private Integer sortOrder;
    private Long locationId; // Optional

    
}