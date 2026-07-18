package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProWorkStationDto {
    private Long id;
    private String workstationNumber;
    private String workstationName;
    private String workGroupName;
    private List<EmployeeSlimDto> employees;
    private Long locationId;
    private String locationName;
    private String machineId;
    private String machineType;
    private Integer capacity;
    private OffsetDateTime createdAt;
}