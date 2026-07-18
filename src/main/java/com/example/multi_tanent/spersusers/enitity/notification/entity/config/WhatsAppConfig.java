package com.example.multi_tanent.spersusers.enitity.notification.entity.config;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.notification.enums.WhatsAppProvider;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "notif_whatsapp_configs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WhatsAppConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false, unique = true)
    private Tenant tenant;

    @Column(name = "is_enabled")
    @Builder.Default
    private Boolean enabled = true;

    @Enumerated(EnumType.STRING)
    private WhatsAppProvider provider;

    @Column(name = "api_key", columnDefinition = "TEXT")
    private String apiKey;

    @Column(name = "phone_number_id", length = 100)
    private String phoneNumberId;

    @Column(name = "waba_id", length = 100)
    private String wabaId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
