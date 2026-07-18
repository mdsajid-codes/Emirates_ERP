package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_vendor_bank_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "vendor")
@EqualsAndHashCode(exclude = "vendor")
public class AtsVendorBankAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_bank_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_bank_vendor"))
    @JsonBackReference("vendor-bank-accounts")
    private AtsVendor vendor;

    @Column(name = "beneficiary_name", nullable = false)
    private String beneficiaryName;

    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_type", length = 100)
    private String accountType;

    @Column(name = "ifsc_routing", length = 100)
    private String ifscRouting;

    @Column(name = "account_number", length = 100)
    private String accountNumber;

    @Column(name = "deposit_amount", length = 100)
    private String depositAmount;

    @Column(name = "priority", length = 100)
    private String priority;

    @Column(name = "comments", length = 1000)
    private String comments;

    @Column(name = "address_line1", length = 250)
    private String addressLine1;

    @Column(name = "address_line2", length = 250)
    private String addressLine2;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "country_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_bank_country"))
    private AtsCountry country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_bank_state"))
    private AtsState state;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "cancelled_cheque_path", length = 2048)
    private String cancelledChequePath;

    @Column(name = "cancelled_cheque_name")
    private String cancelledChequeName;

    @Column(name = "record_status", length = 100)
    private String recordStatus;

    @Column(name = "attachment_path", length = 2048)
    private String attachmentPath;

    @Column(name = "attachment_name")
    private String attachmentName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
