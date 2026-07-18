package com.example.multi_tanent.purchases.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pur_requisition")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurRequisition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "requisition_number", unique = true)
    private String requisitionNumber;

    @Column(name = "requisition_date")
    private LocalDate requisitionDate;

    @Column(name = "requested_by")
    private String requestedBy;

    private String recipient;

    @Column(name = "required_date")
    private LocalDate requiredDate;

    private String entity;

    private String status; // DRAFT, PENDING, APPROVED, REJECTED

    private String basis;

    @Column(length = 2000)
    private String comment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "requisition", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurRequisitionItem> items = new ArrayList<>();

    public void addItem(PurRequisitionItem item) {
        items.add(item);
        item.setRequisition(this);
    }
}
