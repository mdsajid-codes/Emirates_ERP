package com.example.multi_tanent.purchases.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "pur_grn")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurGrn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "grn_number", length = 100)
    private String grnNumber;

    @Column(name = "grn_date")
    private LocalDate grnDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_order_id")
    private PurPurchaseOrder purchaseOrder;

    @Column(name = "remark", length = 2000)
    private String remark;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    // ensure non-null list for builder / JPA usage
    @OneToMany(mappedBy = "grn", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @Builder.Default
    private List<PurGrnItem> items = new ArrayList<>();

    // convenience helper (defensive)
    public void addItem(PurGrnItem item) {
        if (this.items == null)
            this.items = new ArrayList<>();
        item.setGrn(this);
        this.items.add(item);
    }

    public void removeItem(PurGrnItem item) {
        if (this.items != null) {
            this.items.remove(item);
        }
        if (item != null)
            item.setGrn(null);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof PurGrn))
            return false;
        PurGrn that = (PurGrn) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(id);
    }
}
