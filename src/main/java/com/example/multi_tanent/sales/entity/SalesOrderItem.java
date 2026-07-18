package com.example.multi_tanent.sales.entity;

import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.production.entity.ProCategory;
import com.example.multi_tanent.production.entity.ProSubCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "sales_order_items")
public class SalesOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "sales_order_id", nullable = false)
    private SalesOrder salesOrder;

    @ManyToOne
    @JoinColumn(name = "crm_product_id")
    private CrmSalesProduct crmProduct;

    @Column(name = "item_code")
    private String itemCode;

    @Column(name = "item_name")
    private String itemName;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ProCategory category;

    @ManyToOne
    @JoinColumn(name = "subcategory_id")
    private ProSubCategory subcategory;

    private Integer quantity;

    private BigDecimal rate;

    private BigDecimal amount;

    @Column(name = "tax_value")
    private BigDecimal taxValue;

    @Column(name = "is_tax_exempt")
    private boolean isTaxExempt;

    @Column(name = "tax_percentage")
    private BigDecimal taxPercentage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id")
    private com.example.multi_tanent.production.entity.ProRawMaterials rawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semifinished_id")
    private com.example.multi_tanent.production.entity.ProSemifinished semiFinished;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_good_id")
    private com.example.multi_tanent.production.entity.ProFinishedGood finishedGood;
}
