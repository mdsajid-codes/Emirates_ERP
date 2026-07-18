package com.example.multi_tanent.production.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProInventoryTypeDto {
    private Long id;
    private String name;
    private String description;
    private Long locationId;
    private String locationName;
    private boolean active;
    private OffsetDateTime createdAt;
}