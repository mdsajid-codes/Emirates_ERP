package com.example.multi_tanent.spersusers.dto;

import com.example.multi_tanent.spersusers.enitity.Theme;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ThemeResponse {
    private Long id;
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

    public static ThemeResponse fromEntity(Theme theme) {
        return ThemeResponse.builder()
                .id(theme.getId())
                .name(theme.getName())
                // Core Colors
                .primaryColor(theme.getPrimaryColor())
                .secondaryColor(theme.getSecondaryColor())
                .accentColor(theme.getAccentColor())
                .backgroundColor(theme.getBackgroundColor())
                .textColor(theme.getTextColor())
                // Layout Section Colors
                .sidebarBgColor(theme.getSidebarBgColor())
                .sidebarTextColor(theme.getSidebarTextColor())
                .sidebarActiveColor(theme.getSidebarActiveColor())
                .sidebarHoverColor(theme.getSidebarHoverColor())
                .headerBgColor(theme.getHeaderBgColor())
                .headerTextColor(theme.getHeaderTextColor())
                .footerBgColor(theme.getFooterBgColor())
                .footerTextColor(theme.getFooterTextColor())
                // Surface & Component Colors
                .surfaceColor(theme.getSurfaceColor())
                .borderColor(theme.getBorderColor())
                .hoverColor(theme.getHoverColor())
                .linkColor(theme.getLinkColor())
                // Status Colors
                .errorColor(theme.getErrorColor())
                .successColor(theme.getSuccessColor())
                .warningColor(theme.getWarningColor())
                .infoColor(theme.getInfoColor())
                // Typography
                .fontUrl(theme.getFontUrl())
                .fontFamily(theme.getFontFamily())
                // Visual Style
                .borderRadius(theme.getBorderRadius())
                .darkMode(theme.getDarkMode())
                .faviconUrl(theme.getFaviconUrl())
                // Status
                .isActive(theme.getIsActive())
                .build();
    }
}
