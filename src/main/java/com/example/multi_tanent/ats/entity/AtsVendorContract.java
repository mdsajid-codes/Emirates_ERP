package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.ats.enums.ContractStatus;
import com.example.multi_tanent.ats.enums.ContractType;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_vendor_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "vendor")
@EqualsAndHashCode(exclude = "vendor")
public class AtsVendorContract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_contract_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_contract_vendor"))
    @JsonBackReference("vendor-contracts")
    private AtsVendor vendor;

    @Column(name = "contract_number", length = 100)
    private String contractNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type", length = 50)
    private ContractType contractType;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_status", nullable = false, length = 50)
    @Builder.Default
    private ContractStatus contractStatus = ContractStatus.DRAFT;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "signed_date")
    private LocalDate signedDate;

    @Column(name = "payment_terms", length = 500)
    private String paymentTerms;

    @Column(name = "bill_rate", precision = 15, scale = 2)
    private BigDecimal billRate;

    @Column(name = "pay_rate", precision = 15, scale = 2)
    private BigDecimal payRate;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "markup_percent", precision = 5, scale = 2)
    private BigDecimal markupPercent;

    @Column(name = "auto_renew")
    @Builder.Default
    private Boolean autoRenew = false;

    @Column(name = "document_url", length = 500)
    private String documentUrl;

    @Column(name = "snapshot", columnDefinition = "TEXT")
    private String snapshot;

    @Column(name = "contract_notes", length = 4000)
    private String contractNotes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_contract_created_by"))
    private Employee createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
