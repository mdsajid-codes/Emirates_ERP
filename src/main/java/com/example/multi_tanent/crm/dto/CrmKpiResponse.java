package com.example.multi_tanent.crm.dto;


import java.util.HashSet;
import java.util.Set;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrmKpiResponse {
    private Long id;
    private String name;
    private String description;
    private String dataType;
    private String type;
    private Long tenantId;
    private Long locationId;
    private String locationName;

    private Set<CrmKpiRangeResponse> ranges = new HashSet<>();
    private Set<CrmKpiEmployeeResponse> assignedEmployees = new HashSet<>();
}
