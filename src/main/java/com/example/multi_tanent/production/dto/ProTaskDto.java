package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProTaskDto {
    private Long id;
    private String name;
    private String description;
    private Long locationId;
    private String locationName;
    private OffsetDateTime createdAt;
}