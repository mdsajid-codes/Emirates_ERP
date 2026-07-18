package com.example.multi_tanent.pos.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "cash_registers")
public class CashRegister {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "tenant_id")
    private Tenant tenant;

    @Column(name = "opening_time")
    private OffsetDateTime openingTime;

    @Column(name = "closing_time")
    private OffsetDateTime closingTime;

    @Column(name = "opening_float")
    private BigDecimal openingFloat;

    @Column(name = "expected_cash_amount")
    private BigDecimal expectedCashAmount;

    @Column(name = "counted_cash_amount")
    private BigDecimal countedCashAmount;

    @Column(name = "closed_cash_difference")
    private BigDecimal closedCashDifference;

    @Column(name = "notes")
    private String notes;

    @Column(name = "status")
    private String status;
}
