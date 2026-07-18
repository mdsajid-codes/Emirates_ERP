package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ProCategory;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProCategoryResponse {
    private Long id;
    private String name;
    private String code;
    private Long locationId;
    private String locationName;

    public static ProCategoryResponse fromEntity(ProCategory entity) {
        return ProCategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                .build();
    }
}