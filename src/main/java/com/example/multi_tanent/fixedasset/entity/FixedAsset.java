package com.example.multi_tanent.fixedasset.entity;

import com.example.multi_tanent.accounts.entity.enums.AssetStatus;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "fixed_assets")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FixedAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fixed_asset_id")
    private Long fixedAssetId;

    @Column(name = "asset_number", unique = true, nullable = false, length = 50)
    private String assetNumber;

    @Column(nullable = false, length = 200)
    private String description;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private FixedAssetCategory category;

    @Column(length = 100)
    private String location;

    @Column(name = "purchase_date")
    private LocalDate purchaseDate;

    @Column(name = "purchase_price", precision = 19, scale = 4)
    private BigDecimal purchasePrice;

    @Column(name = "salvage_value", precision = 19, scale = 4)
    private BigDecimal salvageValue;

    @Column(name = "useful_life_years")
    private Integer usefulLifeYears;

    @Column(name = "depreciation_method", length = 50)
    private String depreciationMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "asset_status", length = 50)
    private AssetStatus assetStatus;

    @Column(name = "asset_type")
    private String assetType;

    @Column(name = "hired_company")
    private String hiredCompany;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id")
    private FixedAssetClass fixedAssetClass;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private FixedAssetGroup fixedAssetGroup;

    @Column(name = "is_hired_resource")
    private Boolean hiredResource = false;

    @Column(name = "is_use_scheduling")
    private Boolean useScheduling = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
