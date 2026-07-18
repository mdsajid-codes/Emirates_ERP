package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ats_client_guidelines", indexes = {
        @Index(name = "idx_ats_client_guideline_tenant", columnList = "tenant_id"),
        @Index(name = "idx_ats_client_guideline_client", columnList = "client_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"tenant", "client", "guidelineDocuments"})
@EqualsAndHashCode(exclude = {"tenant", "client", "guidelineDocuments"})
public class AtsClientGuideline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_guideline_tenant"))
    private Tenant tenant;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_guideline_client"))
    @JsonBackReference("client-guidelines")
    private AtsClient client;

    @Column(name = "submission_guidelines", columnDefinition = "TEXT")
    private String submissionGuidelines;

    @OneToMany(mappedBy = "guideline", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("guideline-documents")
    @Builder.Default
    private List<AtsClientGuidelineDocument> guidelineDocuments = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
