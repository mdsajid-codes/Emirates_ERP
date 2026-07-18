package com.example.multi_tanent.spersusers.service.impl;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.dto.ThemeRequest;
import com.example.multi_tanent.spersusers.dto.ThemeResponse;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.Theme;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.repository.ThemeRepository;
import com.example.multi_tanent.spersusers.service.ThemeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ThemeServiceImpl implements ThemeService {

    private final ThemeRepository themeRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found: " + tenantId));
    }

    @Override
    public ThemeResponse createTheme(ThemeRequest request) {
        Tenant tenant = getCurrentTenant();

        // If setting as active, deactivate others
        if (request.getIsActive() != null && request.getIsActive()) {
            deactivateAllThemes(tenant.getId());
        }

        Theme theme = Theme.builder()
                .name(request.getName())
                // Core Colors
                .primaryColor(request.getPrimaryColor())
                .secondaryColor(request.getSecondaryColor())
                .accentColor(request.getAccentColor())
                .backgroundColor(request.getBackgroundColor())
                .textColor(request.getTextColor())
                // Layout Section Colors
                .sidebarBgColor(request.getSidebarBgColor())
                .sidebarTextColor(request.getSidebarTextColor())
                .sidebarActiveColor(request.getSidebarActiveColor())
                .sidebarHoverColor(request.getSidebarHoverColor())
                .headerBgColor(request.getHeaderBgColor())
                .headerTextColor(request.getHeaderTextColor())
                .footerBgColor(request.getFooterBgColor())
                .footerTextColor(request.getFooterTextColor())
                // Surface & Component Colors
                .surfaceColor(request.getSurfaceColor())
                .borderColor(request.getBorderColor())
                .hoverColor(request.getHoverColor())
                .linkColor(request.getLinkColor())
                // Status Colors
                .errorColor(request.getErrorColor())
                .successColor(request.getSuccessColor())
                .warningColor(request.getWarningColor())
                .infoColor(request.getInfoColor())
                // Typography
                .fontUrl(request.getFontUrl())
                .fontFamily(request.getFontFamily())
                // Visual Style
                .borderRadius(request.getBorderRadius())
                .darkMode(request.getDarkMode() != null ? request.getDarkMode() : false)
                .faviconUrl(request.getFaviconUrl())
                // Status
                .isActive(request.getIsActive() != null ? request.getIsActive() : false)
                .tenant(tenant)
                .build();

        return ThemeResponse.fromEntity(themeRepository.save(theme));
    }

    @Override
    public ThemeResponse updateTheme(Long id, ThemeRequest request) {
        Tenant tenant = getCurrentTenant();
        Theme theme = themeRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Theme not found with ID: " + id));

        if (request.getIsActive() != null && request.getIsActive() && (!theme.getIsActive() || theme.getIsActive() == null)) {
            deactivateAllThemes(tenant.getId());
        }

        theme.setName(request.getName());
        // Core Colors
        theme.setPrimaryColor(request.getPrimaryColor());
        theme.setSecondaryColor(request.getSecondaryColor());
        theme.setAccentColor(request.getAccentColor());
        theme.setBackgroundColor(request.getBackgroundColor());
        theme.setTextColor(request.getTextColor());
        // Layout Section Colors
        theme.setSidebarBgColor(request.getSidebarBgColor());
        theme.setSidebarTextColor(request.getSidebarTextColor());
        theme.setSidebarActiveColor(request.getSidebarActiveColor());
        theme.setSidebarHoverColor(request.getSidebarHoverColor());
        theme.setHeaderBgColor(request.getHeaderBgColor());
        theme.setHeaderTextColor(request.getHeaderTextColor());
        theme.setFooterBgColor(request.getFooterBgColor());
        theme.setFooterTextColor(request.getFooterTextColor());
        // Surface & Component Colors
        theme.setSurfaceColor(request.getSurfaceColor());
        theme.setBorderColor(request.getBorderColor());
        theme.setHoverColor(request.getHoverColor());
        theme.setLinkColor(request.getLinkColor());
        // Status Colors
        theme.setErrorColor(request.getErrorColor());
        theme.setSuccessColor(request.getSuccessColor());
        theme.setWarningColor(request.getWarningColor());
        theme.setInfoColor(request.getInfoColor());
        // Typography
        theme.setFontUrl(request.getFontUrl());
        theme.setFontFamily(request.getFontFamily());
        // Visual Style
        theme.setBorderRadius(request.getBorderRadius());
        theme.setDarkMode(request.getDarkMode() != null ? request.getDarkMode() : false);
        theme.setFaviconUrl(request.getFaviconUrl());
        // Status
        theme.setIsActive(request.getIsActive() != null ? request.getIsActive() : false);

        return ThemeResponse.fromEntity(themeRepository.save(theme));
    }

    @Override
    @Transactional(readOnly = true)
    public ThemeResponse getTheme(Long id) {
        Tenant tenant = getCurrentTenant();
        Theme theme = themeRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Theme not found with ID: " + id));
        return ThemeResponse.fromEntity(theme);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ThemeResponse> getAllThemes() {
        Tenant tenant = getCurrentTenant();
        return themeRepository.findByTenantId(tenant.getId()).stream()
                .map(ThemeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ThemeResponse getActiveTheme() {
        Tenant tenant = getCurrentTenant();
        return themeRepository.findByTenantIdAndIsActiveTrue(tenant.getId())
                .map(ThemeResponse::fromEntity)
                .orElse(null);
    }

    @Override
    public void deleteTheme(Long id) {
        Tenant tenant = getCurrentTenant();
        Theme theme = themeRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Theme not found with ID: " + id));

        if (theme.getIsActive() != null && theme.getIsActive()) {
            throw new IllegalStateException("Cannot delete active theme");
        }

        themeRepository.delete(theme);
    }

    private void deactivateAllThemes(Long tenantId) {
        List<Theme> themes = themeRepository.findByTenantId(tenantId);
        themes.forEach(t -> t.setIsActive(false));
        themeRepository.saveAll(themes);
    }
}
