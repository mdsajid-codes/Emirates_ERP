package com.example.multi_tanent.sales.entity;

import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.production.entity.ProCategory;
import com.example.multi_tanent.production.entity.ProSubCategory;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProSemifinished;
import com.example.multi_tanent.production.entity.ProFinishedGood;
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
@Table(name = "proforma_invoice_items")
public class ProformaInvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "proforma_invoice_id", nullable = false)
    private ProformaInvoice proformaInvoice;

    @ManyToOne
    @JoinColumn(name = "crm_product_id")
    private CrmSalesProduct crmProduct;

    @ManyToOne
    @JoinColumn(name = "raw_material_id")
    private ProRawMaterials rawMaterial;

    @ManyToOne
    @JoinColumn(name = "semifinished_id")
    private ProSemifinished semiFinished;

    @ManyToOne
    @JoinColumn(name = "finished_good_id")
    private ProFinishedGood finishedGood;

    @Column(name = "item_code")
    private String itemCode;

    @Column(name = "item_name")
    private String itemName;

    @Column(name = "description")
    private String description;

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
}
