package com.example.multi_tanent.warehouse.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareSubCategoryRequest {
    private String name;
    private String description;
    private Long categoryId;
}
