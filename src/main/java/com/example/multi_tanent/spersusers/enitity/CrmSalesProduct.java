package com.example.multi_tanent.spersusers.enitity;

import com.example.multi_tanent.crm.enums.CrmItemType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "crm_sales_products")
public class CrmSalesProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Enumerated(EnumType.STRING)
    @Column(name = "item_type")
    private CrmItemType itemType;

    @Column(name = "is_purchase")
    private Boolean isPurchase;

    @Column(name = "is_sales")
    private Boolean isSales;

    @Column(name = "item_code")
    private String itemCode;

    private String name;

    @Lob
    private String description;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "unit_of_measure")
    private String unitOfMeasure;

    @Column(name = "reorder_limit")
    private Integer reorderLimit;

    @Column(name = "vat_classification_code")
    private String vatClassificationCode;

    @Column(name = "purchase_price")
    private BigDecimal purchasePrice;

    @Column(name = "sales_price")
    private BigDecimal salesPrice;

    private String tax;

    private String barcode;

    @Column(name = "barcode_url")
    private String barcodeUrl;

    @Column(name = "tax_rate")
    private Double taxRate;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null)
            createdAt = OffsetDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
