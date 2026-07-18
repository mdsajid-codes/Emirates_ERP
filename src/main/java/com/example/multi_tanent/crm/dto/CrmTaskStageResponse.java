package com.example.multi_tanent.crm.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CrmTaskStageResponse {
    private Long id;
    private String statusName;
    private boolean completed;
    private boolean isDefault;
    private Integer sortOrder;
    private Long tenantId;
    private Long locationId;
    private String locationName;

   
}