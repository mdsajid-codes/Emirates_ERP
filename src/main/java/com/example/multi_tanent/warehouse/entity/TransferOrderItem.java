package com.example.multi_tanent.warehouse.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "wms_transfer_order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferOrderItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transfer_order_id", nullable = false)
    private TransferOrder transferOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private WareProducts product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "batch_id")
    private WareProductBatch batch;

    @Column(name = "requested_qty", precision = 19, scale = 6, nullable = false)
    private BigDecimal requestedQty;

    @Column(name = "dispatched_qty", precision = 19, scale = 6)
    @Builder.Default
    private BigDecimal dispatchedQty = BigDecimal.ZERO;

    @Column(name = "received_qty", precision = 19, scale = 6)
    @Builder.Default
    private BigDecimal receivedQty = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_bin_id")
    private Bin sourceBin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_bin_id")
    private Bin destinationBin;

    private String remarks;
}
