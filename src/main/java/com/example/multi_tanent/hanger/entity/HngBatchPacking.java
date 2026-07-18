package com.example.multi_tanent.hanger.entity;

import com.example.multi_tanent.hanger.enums.PackingStatus;
import com.example.multi_tanent.hanger.enums.RemainderDisposition;
import com.example.multi_tanent.sales.entity.DeliveryOrder;
import com.example.multi_tanent.sales.entity.SalesOrder;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.warehouse.entity.WareProductBatch;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

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
@Table(name = "hng_batch_packing", uniqueConstraints = @UniqueConstraint(name = "uk_hng_packing_batch_no", columnNames = "packing_batch_no"))
public class HngBatchPacking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id", nullable = false)
    private HngProductionBatch batch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sales_order_id")
    private SalesOrder salesOrder;

    @Column(name = "packing_batch_no", nullable = false, length = 50)
    private String packingBatchNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id")
    private Employee operator;

    @Column(name = "bundle_size")
    private Integer bundleSize;

    @Column(name = "total_bundles")
    private Integer totalBundles;

    @Column(name = "packed_qty")
    private Integer packedQty;

    @Column(name = "remainder_qty")
    private Integer remainderQty;

    @Enumerated(EnumType.STRING)
    @Column(name = "remainder_disposition", length = 20)
    private RemainderDisposition remainderDisposition;

    @Column(name = "gross_weight_kg", precision = 10, scale = 3)
    private BigDecimal grossWeightKg;

    @Column(name = "net_weight_kg", precision = 10, scale = 3)
    private BigDecimal netWeightKg;

    @Column(name = "carton_size", length = 100)
    private String cartonSize;

    @Column(name = "total_cartons")
    private Integer totalCartons;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ware_product_batch_id")
    private WareProductBatch wareProductBatch;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_order_id")
    private DeliveryOrder deliveryOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    private PackingStatus status;

    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    @OneToMany(mappedBy = "packing", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<HngPackingCarton> cartons = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
