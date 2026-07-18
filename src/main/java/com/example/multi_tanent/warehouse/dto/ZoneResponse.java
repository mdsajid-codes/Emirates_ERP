package com.example.multi_tanent.warehouse.dto;

import com.example.multi_tanent.warehouse.enums.ZoneType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoneResponse {
    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private Long floorId;
    private String floorName;
    private String name;
    private ZoneType zoneType;
    private Integer pickPriority;
    private Integer putAwayPriority;
    private Boolean fastMovingZone;
    private Boolean temperatureControlled;
    private Double minTemp;
    private Double maxTemp;
    private Boolean hazardous;
    private String hazardClass;
    private Boolean restrictedAccess;
    private Boolean isActive;
    private Double maxWeight;
    private Double maxVolume;
    private String description;
}
