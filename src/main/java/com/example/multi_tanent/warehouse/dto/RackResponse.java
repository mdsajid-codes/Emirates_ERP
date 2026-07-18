package com.example.multi_tanent.warehouse.dto;

import com.example.multi_tanent.warehouse.enums.RackType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RackResponse {
    private Long id;
    private Long zoneId;
    private String zoneName;
    private String rackCode;
    private String barcodeTag;
    private String barcodeImageUrl;
    private RackType rackType;
    private String aisle;
    private Integer pickSequence;
    private Double maxWeight;
    private Double maxVolume;
    private Boolean isActive;
    private String description;
}
