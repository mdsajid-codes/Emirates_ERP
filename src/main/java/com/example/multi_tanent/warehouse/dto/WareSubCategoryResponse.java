package com.example.multi_tanent.warehouse.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareSubCategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
}
