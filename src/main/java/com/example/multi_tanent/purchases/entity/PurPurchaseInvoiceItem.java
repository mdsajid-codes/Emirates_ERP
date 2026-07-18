package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.production.entity.ProCategory;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProSubCategory;
import com.example.multi_tanent.production.entity.ProTax;
import com.example.multi_tanent.production.entity.ProUnit;

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
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "purchase_invoice_item", uniqueConstraints = @UniqueConstraint(columnNames = { "purchase_invoice_id",
        "line_number" }))
public class PurPurchaseInvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** owning invoice */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_invoice_id", nullable = false)
    private PurPurchaseInvoice purchaseInvoice;

    /** Sr. no / line number */
    @NotNull
    @Column(name = "line_number", nullable = false)
    private Integer lineNumber;

    /** Category / Subcategory / Item selected via UI dropdowns */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private ProCategory category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_category_id")
    private ProSubCategory subCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id")
    private ProRawMaterials item;

    /** Description / long notes per line */
    @Column(name = "description", length = 2000)
    private String description;

    /** Gross and Net quantities (UI shows both) */
    @Column(name = "quantity_gross", precision = 19, scale = 6)
    private BigDecimal quantityGross;

    @Column(name = "quantity_net", precision = 19, scale = 6)
    private BigDecimal quantityNet;

    /** Unit for quantities */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id")
    private ProUnit unit;

    /** Rate and amount */
    @Column(name = "rate", precision = 19, scale = 6)
    private BigDecimal rate;

    @Column(name = "amount", precision = 19, scale = 4)
    private BigDecimal amount;

    /** Tax percent/value for line */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tax_id")
    private ProTax tax;

    @Column(name = "tax_percent", precision = 7, scale = 4)
    private BigDecimal taxPercent;

    /** Discount at line level (if the bill type uses item level discount) */
    @Builder.Default
    @Column(name = "line_discount", precision = 19, scale = 4)
    private BigDecimal lineDiscount = BigDecimal.ZERO;

    @Column(name = "discount_percent", precision = 7, scale = 4)
    private BigDecimal discountPercent;

    // getters/setters omitted for brevity - generate in IDE

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurPurchaseInvoiceItem))
            return false;
        PurPurchaseInvoiceItem that = (PurPurchaseInvoiceItem) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
