package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;

/**
 * Purchase Order header (Add New Purchase Order screen).
 */
@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "pur_purchase_order")
public class PurPurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Domestic / Imported etc (UI dropdown) */
    @NotNull
    @Column(name = "order_category", length = 50, nullable = false)
    private String orderCategory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "project_number", length = 100)
    private String projectNumber;

    /**
     * Supplier reference. Replace ProSupplier with your actual supplier/vendor
     * entity.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private BaseCustomer supplier;

    /** Auto-generated PO number (or manual) */
    @Column(name = "po_number", length = 100, unique = true)
    private String poNumber;

    /** Reference field from UI */
    @Column(name = "reference", length = 255)
    private String reference;

    /** Date shown on UI */
    @NotNull
    @Column(name = "po_date", nullable = false)
    private LocalDate date;

    /**
     * Purchase order discount mode: Without Discount / Item level / Order level
     * (UI)
     */
    @Column(name = "discount_mode", length = 50)
    private String discountMode;

    /** Currency code (UI shows AED button) */
    @Column(name = "currency", length = 10)
    private String currency;

    /** Remarks and notes */
    @Column(name = "remark", length = 2000)
    private String remark;

    @Column(name = "deliver_to_type", length = 50)
    private String deliverToType;

    @Column(name = "deliver_to_id")
    private Long deliverToId;

    @Column(name = "deliver_to_address", length = 2000)
    private String deliverToAddress;

    @Column(name = "template", length = 50)
    private String template;

    @Column(name = "email_to", length = 255)
    private String emailTo;

    @Column(name = "terms_and_conditions", length = 4000)
    private String termsAndConditions;

    @Column(name = "notes", length = 2000)
    private String notes;

    /** Draft / Confirmed / Cancelled etc. */
    @Column(name = "status", length = 50)
    private String status;

    /** Tenant relation — replace with tenantId(Long) if you don't have ProTenant */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    /** Who created */
    @Column(name = "created_by", length = 100)
    private String createdBy;

    // Link PO back to the tendering that generated it
    @Column(name = "tendering_id")
    private Long tenderingId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    /** PO totals cached for convenience */
    @Column(name = "sub_total", precision = 19, scale = 4)
    private BigDecimal subTotal = BigDecimal.ZERO;

    @Column(name = "total_discount", precision = 19, scale = 4)
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    @Column(name = "total_tax", precision = 19, scale = 4)
    private BigDecimal totalTax = BigDecimal.ZERO;

    @Column(name = "other_charges", precision = 19, scale = 4)
    private BigDecimal otherCharges = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 19, scale = 4)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    /** PO lines */
    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("lineNumber ASC")
    private List<PurPurchaseOrderItem> items = new ArrayList<>();

    /** Attachments / uploaded files */
    @OneToMany(mappedBy = "purchaseOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurPurchaseOrderAttachment> attachments = new ArrayList<>();

    // convenience helpers
    public void addItem(PurPurchaseOrderItem item) {
        item.setPurchaseOrder(this);
        items.add(item);
    }

    public void removeItem(PurPurchaseOrderItem item) {
        items.remove(item);
        item.setPurchaseOrder(null);
    }

    public void addAttachment(PurPurchaseOrderAttachment a) {
        a.setPurchaseOrder(this);
        attachments.add(a);
    }

    public void removeAttachment(PurPurchaseOrderAttachment a) {
        attachments.remove(a);
        a.setPurchaseOrder(null);
    }

    // getters & setters (omitted here for brevity in the snippet - generate in IDE)
    // equals/hashCode based on id
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurPurchaseOrder))
            return false;
        PurPurchaseOrder that = (PurPurchaseOrder) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
