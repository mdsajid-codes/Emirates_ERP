package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_client_guideline_documents", indexes = {
        @Index(name = "idx_ats_client_gd_tenant", columnList = "tenant_id"),
        @Index(name = "idx_ats_client_gd_guideline", columnList = "guideline_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"tenant", "guideline"})
@EqualsAndHashCode(exclude = {"tenant", "guideline"})
public class AtsClientGuidelineDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_gd_tenant"))
    private Tenant tenant;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "guideline_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_gd_guideline"))
    @JsonBackReference("guideline-documents")
    private AtsClientGuideline guideline;

    @Column(name = "document_source", length = 50)
    private String documentSource;

    @Column(name = "document_title", nullable = false, length = 255)
    private String documentTitle;

    @Column(name = "description", length = 2000)
    private String description;

    @Column(name = "file_name", length = 300)
    private String fileName;

    @Column(name = "file_path", length = 2048)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type", length = 100)
    private String mimeType;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
