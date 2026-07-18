package com.example.multi_tanent.spersusers.enitity.notification.entity.template;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "notif_whatsapp_templates", uniqueConstraints = {
        @UniqueConstraint(name = "uk_notif_whatsapp_template_tenant_tid", columnNames = { "tenant_id", "template_id" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WhatsAppTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "template_id", nullable = false, length = 100)
    private String templateId;

    @Column(length = 150)
    private String name;

    @Column(name = "whatsapp_template_id", length = 120)
    private String whatsappTemplateId;

    @Column(columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean active = true;

    @Column(name = "language_code", length = 10, nullable = false)
    @Builder.Default
    private String languageCode = "en_US";

    @CreationTimestamp
    @Column(name = "created_at")
    private OffsetDateTime createdAt;

    public Long getId() {
        return id;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getWhatsappTemplateId() {
        return whatsappTemplateId;
    }

    public void setWhatsappTemplateId(String whatsappTemplateId) {
        this.whatsappTemplateId = whatsappTemplateId;
    }

    public String getTemplateId() {
        return templateId;
    }

    public void setTemplateId(String templateId) {
        this.templateId = templateId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public Tenant getTenant() {
        return tenant;
    }

    public void setTenant(Tenant tenant) {
        this.tenant = tenant;
    }
}
