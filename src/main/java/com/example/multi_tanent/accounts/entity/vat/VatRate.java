package com.example.multi_tanent.accounts.entity.vat;

import com.example.multi_tanent.accounts.entity.enums.OutOfScopeReason;
import com.example.multi_tanent.accounts.entity.enums.VatTypeEnum;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vat_rates")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VatRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal rate;

    @Enumerated(EnumType.STRING)
    @Column(name = "vat_type", nullable = false)
    private VatTypeEnum vatType;

    @Enumerated(EnumType.STRING)
    @Column(name = "out_of_scope_reason")
    private OutOfScopeReason outOfScopeReason;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
