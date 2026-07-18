package com.example.multi_tanent.ats.entity;

import com.example.multi_tanent.ats.enums.AiProviderType;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "ats_ai_providers", indexes = {
        @Index(name = "idx_ats_ai_provider_tenant", columnList = "tenant_id"),
        @Index(name = "idx_ats_ai_provider_active", columnList = "tenant_id,is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtsAiProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ats_ai_provider_tenant"))
    private Tenant tenant;

    @Column(name = "provider_name", nullable = false, length = 100)
    private String providerName;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false, length = 50)
    private AiProviderType providerType;

    @Convert(converter = AttributeEncryptor.class)
    @Column(name = "api_key", nullable = false, length = 1000)
    private String apiKey;

    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "base_url", length = 500)
    private String baseUrl;

    @Column(name = "max_tokens")
    @Builder.Default
    private Integer maxTokens = 4096;

    @Column(name = "temperature")
    @Builder.Default
    private Double temperature = 0.0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = false;

    @Column(name = "is_enabled", nullable = false)
    @Builder.Default
    private Boolean isEnabled = true;

    @Column(name = "description", length = 500)
    private String description;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
