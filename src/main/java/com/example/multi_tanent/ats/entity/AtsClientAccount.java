package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_client_accounts", indexes = {
        @Index(name = "idx_ats_client_acc_tenant", columnList = "tenant_id"),
        @Index(name = "idx_ats_client_acc_client", columnList = "client_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"tenant", "client"})
@EqualsAndHashCode(exclude = {"tenant", "client"})
public class AtsClientAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_account_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_account_client"))
    @JsonBackReference("client-accounts")
    private AtsClient client;

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

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
