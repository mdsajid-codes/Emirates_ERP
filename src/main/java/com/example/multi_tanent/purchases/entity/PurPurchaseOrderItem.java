package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Objects;

import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.production.entity.ProCategory;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProSubCategory;
import com.example.multi_tanent.production.entity.ProTax;
import com.example.multi_tanent.production.entity.ProUnit;

/**
 * One line on the purchase order (Item & Description, quantity, rate, tax,
 * amount).
 */
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "pur_purchase_order_item", uniqueConstraints = @UniqueConstraint(columnNames = { "purchase_order_id",
        "line_number" }))
public class PurPurchaseOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Line number shown in UI */
    @NotNull
    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurPurchaseOrder purchaseOrder;

    /** Category/Subcategory picker used in UI (optional) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_category_id")
    private ProSubCategory subCategory;

    /** Item references across all 4 product types like Sales Order */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "crm_product_id")
    private CrmSalesProduct crmProduct;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "raw_material_id")
    private ProRawMaterials rawMaterial;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "semifinished_id")
    private com.example.multi_tanent.production.entity.ProSemifinished semiFinished;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "finished_good_id")
    private com.example.multi_tanent.production.entity.ProFinishedGood finishedGood;

    /** Legacy raw material reference */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private ProRawMaterials item;

    /** Free-text item description */
    @Column(name = "description", length = 2000)
    private String description;

    /** Quantity ordered */
    @NotNull
    @DecimalMin(value = "0.000001", inclusive = true)
    @Column(name = "quantity", precision = 19, scale = 6, nullable = false)
    private BigDecimal quantity;

    /** Unit for the quantity */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private ProUnit unit;

    /** Rate (price per unit) */
    @Column(name = "rate", precision = 19, scale = 4)
    private BigDecimal rate;

    /** Computed amount (quantity * rate minus item-level discounts if any) */
    @Column(name = "amount", precision = 19, scale = 4)
    private BigDecimal amount;

    /** Tax information — reference to ProTax */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_id")
    private ProTax tax;

    /** Is tax exempt for this line (UI checkbox) */
    @Column(name = "tax_exempt")
    private Boolean taxExempt = Boolean.FALSE;

    /** Tax percentage override if needed */
    @Column(name = "tax_percent", precision = 7, scale = 4)
    private BigDecimal taxPercent;

    /** Line-level discount (if UI supports) */
    @Column(name = "line_discount", precision = 19, scale = 4)
    private BigDecimal lineDiscount = BigDecimal.ZERO;

    @Column(name = "discount_percent", precision = 7, scale = 4)
    private BigDecimal discountPercent;

    @Column(name = "received_quantity", precision = 19, scale = 6)
    private BigDecimal receivedQuantity = BigDecimal.ZERO;

    // getters / setters omitted for brevity - generate in your IDE
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurPurchaseOrderItem))
            return false;
        PurPurchaseOrderItem that = (PurPurchaseOrderItem) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
