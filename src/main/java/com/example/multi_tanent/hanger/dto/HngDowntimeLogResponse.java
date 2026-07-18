package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.DowntimeCategory;
import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@Builder
public class HngDowntimeLogResponse {
    private Long id;
    private Long workstationId;
    private String workstationName;
    private String machineId;
    private Long batchId;
    private String batchNo;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private Integer durationMinutes;
    private DowntimeCategory downtimeCategory;
    private String notes;
    private OffsetDateTime createdAt;
}
