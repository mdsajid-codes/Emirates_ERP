package com.example.multi_tanent.purchases.entity;

import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Setter@Getter@NoArgsConstructor
@AllArgsConstructor@Builder
@Table(name = "purchase_invoice_attachment")
public class PurPurchaseInvoiceAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** owning invoice */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_invoice_id", nullable = false)
    private PurPurchaseInvoice purchaseInvoice;

    @Column(name = "file_name", length = 255)
    private String fileName;

    /** storage path or URL */
    @Column(name = "file_path", length = 1024)
    private String filePath;

    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    // getters/setters omitted for brevity

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PurPurchaseInvoiceAttachment)) return false;
        PurPurchaseInvoiceAttachment that = (PurPurchaseInvoiceAttachment) o;
        return id != null && id.equals(that.id);
    }
    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}

