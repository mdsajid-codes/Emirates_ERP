package com.example.multi_tanent.production.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class ProToolsDto {
    private Long id;
    private String name;
    private LocalDate manufacturingDate;

    private Long workGroupId;
    private String workGroupName;

    private Long workstationId;
    private String workstationName;

    private Long categoryId;
    private String categoryName;

    private Long locationId;
    private String locationName;

    private List<ProToolStationDto> stations;
    private List<ToolParameterDto> parameters;
    private OffsetDateTime createdAt;
}