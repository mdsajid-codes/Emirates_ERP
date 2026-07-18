package com.example.multi_tanent.warehouse.dto;

import com.example.multi_tanent.warehouse.enums.FloorAccessType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloorResponse {
    private Long id;
    private Long warehouseId;
    private String warehouseName;
    private String code;
    private String name;
    private String description;
    private Integer levelNo;
    private Double length;
    private Double width;
    private Double height;
    private FloorAccessType accessType;
    private Boolean temperatureControlled;
    private Double minTemp;
    private Double maxTemp;
    private Boolean hazardousAllowed;
    private Boolean restrictedAccess;
    private Boolean isDefaultFloor;
    private Boolean isActive;
}
