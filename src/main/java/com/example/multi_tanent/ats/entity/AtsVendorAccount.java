package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_vendor_accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "vendor")
@EqualsAndHashCode(exclude = "vendor")
public class AtsVendorAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_account_tenant"))
    private Tenant tenant;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_account_vendor"))
    @JsonBackReference("vendor-account")
    private AtsVendor vendor;

    @Column(name = "contact_person", length = 150)
    private String contactPerson;

    @Column(name = "mobile_number", length = 30)
    private String mobileNumber;

    @Column(name = "office_number", length = 30)
    private String officeNumber;

    @Column(name = "office_extension", length = 10)
    private String officeExtension;

    @Column(name = "email_id", length = 150)
    private String emailId;

    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "payment_terms", length = 200)
    private String paymentTerms;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "payment_term_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_account_payment_term"))
    private AtsPaymentTerms paymentTerm;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
