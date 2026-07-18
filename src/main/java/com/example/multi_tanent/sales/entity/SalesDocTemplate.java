package com.example.multi_tanent.sales.entity;

import com.example.multi_tanent.sales.enums.SalesDocType;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "sales_doc_templates", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "tenant_id", "name", "doc_type" })
})
@Getter
@Setter
public class SalesDocTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "doc_type", nullable = false)
    private SalesDocType docType;

    @Lob
    @Column(nullable = false, columnDefinition = "longtext")
    private String templateContent; // Stores the HTML template

    @Column(name = "is_default")
    private boolean isDefault = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
