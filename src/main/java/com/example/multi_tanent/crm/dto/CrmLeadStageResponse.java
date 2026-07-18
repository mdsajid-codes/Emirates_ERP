package com.example.multi_tanent.crm.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CrmLeadStageResponse {
    private Long id;
    private String name;
    private Integer sortOrder;
    private Boolean isDefault;

    private Long locationId;
    private String locationName;

    private Long tenantId;

    private com.example.multi_tanent.crm.enums.CrmStageMoveTo moveTo;
    private Boolean isConverted;
    private Boolean isWon;
    private Boolean isMql;
    private Boolean isSql;
    private Double probability;
    private Boolean assignTo;
}