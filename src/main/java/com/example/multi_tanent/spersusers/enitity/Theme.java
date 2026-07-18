package com.example.multi_tanent.spersusers.enitity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "themes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Theme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    // ── Core Colors ──
    @Column(name = "primary_color")
    private String primaryColor;

    @Column(name = "secondary_color")
    private String secondaryColor;

    @Column(name = "accent_color")
    private String accentColor;

    @Column(name = "background_color")
    private String backgroundColor;

    @Column(name = "text_color")
    private String textColor;

    // ── Layout Section Colors ──
    @Column(name = "sidebar_bg_color")
    private String sidebarBgColor;

    @Column(name = "sidebar_text_color")
    private String sidebarTextColor;

    @Column(name = "sidebar_active_color")
    private String sidebarActiveColor;

    @Column(name = "sidebar_hover_color")
    private String sidebarHoverColor;

    @Column(name = "header_bg_color")
    private String headerBgColor;

    @Column(name = "header_text_color")
    private String headerTextColor;

    @Column(name = "footer_bg_color")
    private String footerBgColor;

    @Column(name = "footer_text_color")
    private String footerTextColor;

    // ── Surface & Component Colors ──
    @Column(name = "surface_color")
    private String surfaceColor;

    @Column(name = "border_color")
    private String borderColor;

    @Column(name = "hover_color")
    private String hoverColor;

    @Column(name = "link_color")
    private String linkColor;

    // ── Status Colors ──
    @Column(name = "error_color")
    private String errorColor;

    @Column(name = "success_color")
    private String successColor;

    @Column(name = "warning_color")
    private String warningColor;

    @Column(name = "info_color")
    private String infoColor;

    // ── Typography ──
    @Column(name = "font_url")
    private String fontUrl;

    @Column(name = "font_family")
    private String fontFamily;

    // ── Visual Style ──
    @Column(name = "border_radius")
    private String borderRadius;

    @Column(name = "dark_mode")
    private Boolean darkMode;

    @Column(name = "favicon_url")
    private String faviconUrl;

    // ── Status ──
    @Column(nullable = false, name = "is_active")
    private Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @CreationTimestamp
    @Column(updatable = false, name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
