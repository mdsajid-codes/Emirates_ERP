package com.example.multi_tanent.hanger.dto;

import com.example.multi_tanent.hanger.enums.DowntimeCategory;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class HngDowntimeLogRequest {
    private Long workstationId;
    private Long batchId;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private DowntimeCategory downtimeCategory;
    private String notes;
}
