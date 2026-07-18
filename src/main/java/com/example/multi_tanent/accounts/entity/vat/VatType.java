package com.example.multi_tanent.accounts.entity.vat;

import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "vat_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VatType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vat_group_id", nullable = false)
    private VatGroup vatGroup;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receivable_gl_account_id", nullable = false)
    private ChartOfAccount receivableGlAccount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payable_gl_account_id", nullable = false)
    private ChartOfAccount payableGlAccount;

    @Column(name = "tenant_id", nullable = false)
    private String tenantId;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;
}
