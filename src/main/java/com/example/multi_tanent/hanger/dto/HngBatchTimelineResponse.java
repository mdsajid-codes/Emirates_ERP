package com.example.multi_tanent.hanger.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HngBatchTimelineResponse {
    private List<TimelineEvent> events;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimelineEvent {
        private OffsetDateTime timestamp;
        private String type; // STAGE_CHANGE, JOB_CARD, QC_INSPECTION, SCRAP, REWORK, DOWNTIME, PACKING
        private String title;
        private String description;
        private String icon; // Icon name for frontend
        private String color; // Color class for frontend
        private Map<String, Object> metadata;
        private Long referenceId;
    }
}
