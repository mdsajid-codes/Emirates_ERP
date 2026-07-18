package com.example.multi_tanent.production.entity;

import com.example.multi_tanent.production.enums.ManufacturingOrderStatus;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "pro_manufacturing_orders")
public class ProManufacturingOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(name = "mo_number", nullable = false, unique = true)
    private String moNumber;

    @Column(name = "so_number")
    private String soNumber;

    @Column(name = "customer")
    private String customer;

    @Column(name = "reference_no")
    private String referenceNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private ProSemifinished item;

    @Column(name = "quantity", precision = 19, scale = 4)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 50)
    @Builder.Default
    private ManufacturingOrderStatus status = ManufacturingOrderStatus.SCHEDULED;

    @Column(name = "schedule_start")
    private OffsetDateTime scheduleStart;

    @Column(name = "schedule_finish")
    private OffsetDateTime scheduleFinish;

    @Column(name = "due_date")
    private OffsetDateTime dueDate;

    @Column(name = "actual_start")
    private OffsetDateTime actualStart;

    @Column(name = "actual_finish")
    private OffsetDateTime actualFinish;

    @Column(name = "assign_to")
    private String assignTo;

    @Column(name = "batch_no")
    private String batchNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bom_id")
    private BomSemiFinished bom;

    @OneToMany(mappedBy = "manufacturingOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProManufacturingOrderFile> files = new ArrayList<>();

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
