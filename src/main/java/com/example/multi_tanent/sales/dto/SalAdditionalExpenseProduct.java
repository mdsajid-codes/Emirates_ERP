package com.example.multi_tanent.sales.dto;

import com.example.multi_tanent.production.enums.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalAdditionalExpenseProduct {
    private Long id;
    private String name;
    private String itemCode;
    private ItemType itemType;
    private String category;
}
