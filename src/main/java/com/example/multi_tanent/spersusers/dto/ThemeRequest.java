package com.example.multi_tanent.spersusers.dto;

import lombok.Data;

@Data
public class ThemeRequest {
    private String name;

    // Core Colors
    private String primaryColor;
    private String secondaryColor;
    private String accentColor;
    private String backgroundColor;
    private String textColor;

    // Layout Section Colors
    private String sidebarBgColor;
    private String sidebarTextColor;
    private String sidebarActiveColor;
    private String sidebarHoverColor;
    private String headerBgColor;
    private String headerTextColor;
    private String footerBgColor;
    private String footerTextColor;

    // Surface & Component Colors
    private String surfaceColor;
    private String borderColor;
    private String hoverColor;
    private String linkColor;

    // Status Colors
    private String errorColor;
    private String successColor;
    private String warningColor;
    private String infoColor;

    // Typography
    private String fontUrl;
    private String fontFamily;

    // Visual Style
    private String borderRadius;
    private Boolean darkMode;
    private String faviconUrl;

    // Status
    private Boolean isActive;
}
