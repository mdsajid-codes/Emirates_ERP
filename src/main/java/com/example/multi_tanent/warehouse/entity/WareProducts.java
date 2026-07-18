package com.example.multi_tanent.warehouse.entity;

import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProFinishedGood;
import com.example.multi_tanent.production.entity.ProSemifinished;
import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.warehouse.enums.ProductSourceType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ware_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WareProducts {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- Source Product Links (only ONE should be set) ---
    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", length = 20)
    private ProductSourceType sourceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crm_product_id")
    private CrmSalesProduct crmProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id")
    private ProRawMaterials rawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semifinished_id")
    private ProSemifinished semifinished;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_good_id")
    private ProFinishedGood finishedGood;

    // --- End Source Product Links ---

    @Column(nullable = false, unique = true)
    private String sku;

    @Column(nullable = false)
    private String name;

    private String barcode;

    @Column(name = "barcode_image_url")
    private String barcodeImageUrl;

    @Column(name = "image_url")
    private String imageUrl;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private WareCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subcategory_id")
    private WareSubCategory subCategory;

    private String brand;

    private String model;

    @Column(name = "purchase_price")
    private BigDecimal purchasePrice;

    @Column(name = "sale_price")
    private BigDecimal salePrice;

    @Builder.Default
    @Column(name = "tax_inclusive")
    private Boolean taxInclusive = true;

    @Builder.Default
    @Column(name = "batch_tracking")
    private Boolean batchTracking = true;

    @Builder.Default
    @Column(name = "serial_tracking")
    private Boolean serialTracking = false;

    @Builder.Default
    @Column(name = "expiry_tracking")
    private Boolean expiryTracking = true;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uom_id")
    private UoM uom;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_id")
    private WareTax tax;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id")
    private WareHouse warehouse;

    // --- Stock Quantity ---
    @Builder.Default
    @Column(name = "stock_quantity", precision = 19, scale = 4)
    private BigDecimal stockQuantity = BigDecimal.ZERO;

    // --- Stock Alert Fields ---
    @Column(name = "min_stock_level", precision = 19, scale = 4)
    private BigDecimal minStockLevel;

    @Column(name = "max_stock_level", precision = 19, scale = 4)
    private BigDecimal maxStockLevel;

    @Column(name = "reorder_point", precision = 19, scale = 4)
    private BigDecimal reorderPoint;
    // --- End Stock Alert Fields ---

    @Builder.Default
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WareProductBatch> batches = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
