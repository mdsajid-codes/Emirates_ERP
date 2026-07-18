package com.example.multi_tanent.sales.entity;

import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.production.entity.ProCategory;
import com.example.multi_tanent.production.entity.ProSubCategory;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "delivery_order_items")
public class DeliveryOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "delivery_order_id", nullable = false)
    private DeliveryOrder deliveryOrder;

    @ManyToOne
    @JoinColumn(name = "crm_product_id")
    private CrmSalesProduct crmProduct;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ProCategory category;

    @ManyToOne
    @JoinColumn(name = "subcategory_id")
    private ProSubCategory subcategory;

    @Column(name = "item_code", length = 100)
    private String itemCode;

    @Column(name = "item_name", length = 255)
    private String itemName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "quantity")
    private Integer quantity;

    @Column(name = "rate", precision = 19, scale = 4)
    private BigDecimal rate;

    @Column(name = "amount", precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(name = "tax_value", precision = 19, scale = 4)
    private BigDecimal taxValue;

    @Column(name = "tax_percentage")
    private Double taxPercentage;

    @Column(name = "is_tax_exempt")
    private boolean isTaxExempt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id")
    private com.example.multi_tanent.production.entity.ProRawMaterials proRawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semifinished_id")
    private com.example.multi_tanent.production.entity.ProSemifinished proSemifinished;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_good_id")
    private com.example.multi_tanent.production.entity.ProFinishedGood proFinishedGood;
}
