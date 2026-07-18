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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * File attachments uploaded from the Add Purchase Order screen.
 */
@Entity
@Table(name = "pur_purchase_order_attachment")
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurPurchaseOrderAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id", nullable = false)
    private PurPurchaseOrder purchaseOrder;

    /** original filename */
    @Column(name = "file_name", length = 255)
    private String fileName;

    /** storage path (or URL) */
    @Column(name = "file_path", length = 1024)
    private String filePath;

    /** uploaded by / time */
    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    // equals/hashCode
    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurPurchaseOrderAttachment))
            return false;
        PurPurchaseOrderAttachment that = (PurPurchaseOrderAttachment) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
