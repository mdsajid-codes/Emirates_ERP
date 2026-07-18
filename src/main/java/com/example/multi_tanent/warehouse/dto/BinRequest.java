package com.example.multi_tanent.warehouse.dto;

import com.example.multi_tanent.warehouse.enums.BinType;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BinRequest {
    private Long shelfId;
    private Long warehouseId;
    private String binCode;
    private String barcodeTag;
    private BinType binType;
    private Integer capacityQty;
    private Double capacityWeight;
    private Double capacityVolume;
    private Boolean isActive;
    private Boolean blocked;
    private String blockReason;
    private Integer pickSequence;
    private Boolean hazardousAllowed;
    private Double minTemp;
    private Double maxTemp;
    private String description;
}
