package com.example.multi_tanent.warehouse.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShelfRequest {
    private Long rackId;
    private String shelfCode;
    private String barcodeTag;
    private Integer levelNo;
    private Integer pickSequence;
    private Double maxWeight;
    private Double maxVolume;
    private Boolean isActive;
    private String description;
}
