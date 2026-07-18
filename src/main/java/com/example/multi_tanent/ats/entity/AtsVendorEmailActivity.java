package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.ats.enums.EmailDirection;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_vendor_email_activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "vendor")
@EqualsAndHashCode(exclude = "vendor")
public class AtsVendorEmailActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_email_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_vendor_email_vendor"))
    @JsonBackReference("vendor-emails")
    private AtsVendor vendor;

    @Column(name = "subject", nullable = false, length = 500)
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false, length = 20)
    private EmailDirection direction;

    @Column(name = "from_address", length = 150)
    private String fromAddress;

    @Column(name = "to_addresses", length = 1000)
    private String toAddresses;

    @Column(name = "cc_addresses", length = 500)
    private String ccAddresses;

    @Column(name = "sent_at")
    private OffsetDateTime sentAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "linked_by_id", foreignKey = @ForeignKey(name = "fk_ats_vendor_email_linked_by"))
    private Employee linkedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
