package com.example.multi_tanent.warehouse.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShelfResponse {
    private Long id;
    private Long rackId;
    private String rackCode;
    private String shelfCode;
    private String barcodeTag;
    private String barcodeImageUrl;
    private Integer levelNo;
    private Integer pickSequence;
    private Double maxWeight;
    private Double maxVolume;
    private Boolean isActive;
    private String description;
}
