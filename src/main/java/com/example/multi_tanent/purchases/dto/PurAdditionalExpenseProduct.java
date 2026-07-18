package com.example.multi_tanent.purchases.dto;

import com.example.multi_tanent.production.enums.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurAdditionalExpenseProduct {
    private Long id;
    private String name;
    private String itemCode;
    private ItemType itemType;
    private String category; // e.g. "RM", "SFG", "FG"
}
