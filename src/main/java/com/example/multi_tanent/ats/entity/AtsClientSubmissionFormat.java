package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ats_client_submission_formats", indexes = {
        @Index(name = "idx_ats_client_sub_format_tenant", columnList = "tenant_id"),
        @Index(name = "idx_ats_client_sub_format_client", columnList = "client_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"tenant", "client"})
@EqualsAndHashCode(exclude = {"tenant", "client"})
public class AtsClientSubmissionFormat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_sub_format_tenant"))
    private Tenant tenant;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_client_sub_format_client"))
    @JsonBackReference("client-submission-format")
    private AtsClient client;

    @Column(name = "mailing_subject", length = 500)
    private String mailingSubject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(
            name = "ats_client_submission_excel_fields",
            joinColumns = @JoinColumn(name = "submission_format_id"),
            foreignKey = @ForeignKey(name = "fk_ats_csef_format")
    )
    @Column(name = "field_name", length = 100)
    @OrderColumn(name = "sort_order")
    @Builder.Default
    private List<String> excelFields = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
