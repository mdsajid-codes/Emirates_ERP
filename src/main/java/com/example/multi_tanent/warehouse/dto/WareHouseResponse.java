package com.example.multi_tanent.warehouse.dto;

import com.example.multi_tanent.warehouse.enums.PickingStrategy;
import com.example.multi_tanent.warehouse.enums.WarehouseType;
import lombok.*;

import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareHouseResponse {
    private Long id;
    private String code;
    private String name;
    private String address;
    private String contactPerson;
    private String contactPhone;
    private String contactEmail;
    private Boolean qcRequired;
    private Boolean binTrackingEnabled;
    private Boolean isActive;
    private String description;
    private WarehouseType warehouseType;
    private PickingStrategy defaultPickStrategy;
    private Boolean allowNegativeStock;
    private LocalTime openTime;
    private LocalTime closeTime;
    private Double latitude;
    private Double longitude;
    private Double totalCapacityWeight;
    private Double totalCapacityVolume;
    private Long locationId;
    private String locationName;
}
