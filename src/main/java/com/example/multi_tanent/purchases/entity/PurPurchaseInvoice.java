package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Tenant;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
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

@Entity
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "purchase_invoice")
public class PurPurchaseInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Bill ledger (e.g., Purchase / Purchase (Import)) */
    @Column(name = "bill_ledger", length = 100)
    private String billLedger;

    /** Supplier / Customer reference (supplier for purchase bills) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private BaseCustomer supplier;

    /** Bill number */
    @Column(name = "bill_number", length = 100)
    private String billNumber;

    /** Order number reference (optional) */
    @Column(name = "order_number", length = 100)
    private String orderNumber;

    /** Bill date and due date */
    @NotNull
    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    /**
     * Bill Type: Without Discount / With Discount At Item Level / With Discount At
     * Bill Order Level
     */
    @Column(name = "bill_type", length = 50)
    private String billType;

    /** Enable gross/net weight UI toggle */
    @Column(name = "gross_net_enabled")
    private Boolean grossNetEnabled = Boolean.FALSE;

    /** Tenant relation */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    /** Notes and terms */
    @Column(name = "notes", length = 2000)
    private String notes;

    /** Totals */
    @Column(name = "sub_total", precision = 19, scale = 4)
    private BigDecimal subTotal = BigDecimal.ZERO;

    @Column(name = "total_discount", precision = 19, scale = 4)
    private BigDecimal totalDiscount = BigDecimal.ZERO;

    @Column(name = "gross_total", precision = 19, scale = 4)
    private BigDecimal grossTotal = BigDecimal.ZERO;

    @Column(name = "total_tax", precision = 19, scale = 4)
    private BigDecimal totalTax = BigDecimal.ZERO;

    @Column(name = "other_charges", precision = 19, scale = 4)
    private BigDecimal otherCharges = BigDecimal.ZERO;

    @Column(name = "net_total", precision = 19, scale = 4)
    private BigDecimal netTotal = BigDecimal.ZERO;

    /** header attachments */
    @OneToMany(mappedBy = "purchaseInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PurPurchaseInvoiceAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "purchaseInvoice", fetch = FetchType.LAZY)
    private List<PurPurchasePaymentAllocation> paymentAllocations = new ArrayList<>();

    /** bill lines */
    @OneToMany(mappedBy = "purchaseInvoice", cascade = CascadeType.ALL, orphanRemoval = true)
    // @OrderBy("lineNumber ASC")
    private List<PurPurchaseInvoiceItem> lines = new ArrayList<>();

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "template", length = 100)
    private String template;

    // convenience helpers
    public void addLine(PurPurchaseInvoiceItem line) {
        line.setPurchaseInvoice(this);
        lines.add(line);
    }

    public void removeLine(PurPurchaseInvoiceItem line) {
        lines.remove(line);
        line.setPurchaseInvoice(null);
    }

    public void addAttachment(PurPurchaseInvoiceAttachment a) {
        a.setPurchaseInvoice(this);
        attachments.add(a);
    }

    public void removeAttachment(PurPurchaseInvoiceAttachment a) {
        attachments.remove(a);
        a.setPurchaseInvoice(null);
    }

    // getters/setters omitted for brevity - generate in IDE

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurPurchaseInvoice))
            return false;
        PurPurchaseInvoice that = (PurPurchaseInvoice) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
