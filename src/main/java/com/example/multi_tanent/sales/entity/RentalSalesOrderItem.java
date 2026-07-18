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
@Table(name = "rental_sales_order_items")
public class RentalSalesOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "rental_sales_order_id", nullable = false)
    private RentalSalesOrder rentalSalesOrder;

    @ManyToOne
    @JoinColumn(name = "crm_product_id")
    private CrmSalesProduct crmProduct;

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

    @Column(name = "rental_value")
    private BigDecimal rentalValue; // Rate per day/unit

    private BigDecimal amount; // quantity * rentalValue

    @Column(name = "tax_value")
    private BigDecimal taxValue;

    @Column(name = "is_tax_exempt")
    private boolean isTaxExempt;

    @Column(name = "tax_percentage")
    private BigDecimal taxPercentage;
}
