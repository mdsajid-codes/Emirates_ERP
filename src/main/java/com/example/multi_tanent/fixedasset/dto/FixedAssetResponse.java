package com.example.multi_tanent.fixedasset.dto;

import com.example.multi_tanent.accounts.entity.enums.AssetStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixedAssetResponse {
    private Long fixedAssetId;
    private String assetNumber;
    private String description;
    private String serialNumber;
    private Long categoryId;
    private String categoryName;
    private String location;
    private LocalDate purchaseDate;
    private BigDecimal purchasePrice;
    private BigDecimal salvageValue;
    private Integer usefulLifeYears;
    private String depreciationMethod;
    private AssetStatus assetStatus;
    private String assetType;
    private String hiredCompany;
    private Long classId;
    private String className;
    private Long groupId;
    private String groupName;
    private Boolean hiredResource;
    private Boolean useScheduling;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
