package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ProUnit;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProUnitResponse {
    private Long id;
    private String name;
    private String description;
    private Long locationId;
    private String locationName;

    public static ProUnitResponse fromEntity(ProUnit entity) {
        return ProUnitResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .description(entity.getDescription())
                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                .build();
    }
}