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
import lombok.Getter;
import lombok.NoArgsConstructor;

import lombok.Setter;

@Entity
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "purchase_payment_attachment")
public class PurPurchasePaymentAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** owning payment */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_payment_id", nullable = false)
    private PurPurchasePayment purchasePayment;

    @Column(name = "file_name", length = 255)
    private String fileName;

    /** storage path or URL; sample uses local uploaded file path as example */
    @Column(name = "file_path", length = 1024)
    private String filePath;

    @Column(name = "uploaded_by", length = 100)
    private String uploadedBy;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    // getters/setters omitted for brevity

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurPurchasePaymentAttachment))
            return false;
        PurPurchasePaymentAttachment that = (PurPurchasePaymentAttachment) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
