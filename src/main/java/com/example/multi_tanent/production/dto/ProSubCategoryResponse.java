package com.example.multi_tanent.production.dto;

import com.example.multi_tanent.production.entity.ProSubCategory;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProSubCategoryResponse {
    private Long id;
    private String name;
    private String code;
    private Long categoryId;
    private String categoryName;
    private Long locationId;
    private String locationName;

    public static ProSubCategoryResponse fromEntity(ProSubCategory entity) {
        return ProSubCategoryResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .code(entity.getCode())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory() != null ? entity.getCategory().getName() : null)
                .locationId(entity.getLocation() != null ? entity.getLocation().getId() : null)
                .locationName(entity.getLocation() != null ? entity.getLocation().getName() : null)
                .build();
    }
}