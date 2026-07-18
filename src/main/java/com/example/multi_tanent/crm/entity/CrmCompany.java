package com.example.multi_tanent.crm.entity;

import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.CrmIndustry;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "crm_companies", uniqueConstraints = @UniqueConstraint(columnNames = { "tenant_id", "name" }))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrmCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id")
    private Location location;

    @Column(nullable = false, name = "name")
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_type_id")
    private CompanyType companyType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "industry_id")
    private CrmIndustry industry;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "website")
    private String website;

    /** Company Owner Name */
    @Column(name = "company_owner")
    private String companyOwner;

    /** Parent Company for hierarchies */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_company_id", foreignKey = @ForeignKey(name = "fk_company_parent"))
    private CrmCompany parentCompany;

    /* ---------- Billing Address ---------- */
    @Column(name = "billing_street")
    private String billingStreet;

    @Column(name = "billing_city")
    private String billingCity;

    @Column(name = "billing_zip")
    private String billingZip;

    @Column(name = "billing_state")
    private String billingState;

    @Column(name = "billing_country")
    private String billingCountry;

    /* ---------- Shipping Address ---------- */
    @Column(name = "shipping_street")
    private String shippingStreet;

    @Column(name = "shipping_city")
    private String shippingCity;

    @Column(name = "shipping_zip")
    private String shippingZip;

    @Column(name = "shipping_state")
    private String shippingState;

    @Column(name = "shipping_country")
    private String shippingCountry;

    @CreationTimestamp
    @Column(updatable = false, nullable = false, name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false, name = "updated_at")
    private OffsetDateTime updatedAt;
}