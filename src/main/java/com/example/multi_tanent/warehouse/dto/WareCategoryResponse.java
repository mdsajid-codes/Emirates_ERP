package com.example.multi_tanent.warehouse.dto;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareCategoryResponse {
    private Long id;
    private String name;
    private String description;
    private List<WareSubCategoryResponse> subCategories;
}
