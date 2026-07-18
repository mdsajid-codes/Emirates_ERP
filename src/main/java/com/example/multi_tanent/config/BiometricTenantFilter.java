package com.example.multi_tanent.config;

import com.example.multi_tanent.master.entity.TenantApiKey;
import com.example.multi_tanent.master.repository.TenantApiKeyRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
@Order(1) // Ensure this runs before other security filters
public class BiometricTenantFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(BiometricTenantFilter.class);
    private final TenantApiKeyRepository apiKeyRepository;

    public BiometricTenantFilter(TenantApiKeyRepository apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        if (path.startsWith("/api/biometric-punch") || path.startsWith("/api/biometric/")) {
            // Priority 1: X-API-KEY header (New universal method)
            String apiKey = request.getHeader("X-API-KEY");
            if (apiKey != null) {
                Optional<TenantApiKey> tenantApiKey = apiKeyRepository.findByApiKey(apiKey);
                if (tenantApiKey.isPresent()) {
                    String tenantId = tenantApiKey.get().getTenantId();
                    TenantContext.setTenantId(tenantId);
                    logger.info("BiometricTenantFilter: Set tenant context to '{}' via API Key", tenantId);
                } else {
                    logger.warn("BiometricTenantFilter: Invalid API Key provided: {}", apiKey);
                }
            } else if (path.startsWith("/api/biometric-punch")) {
                // Priority 2: Path variable (Legacy method / fallback)
                String[] pathParts = path.split("/");
                if (pathParts.length > 3) {
                    String tenantId = pathParts[3];
                    TenantContext.setTenantId(tenantId);
                    logger.info("BiometricTenantFilter: Set tenant context to '{}' via URL path", tenantId);
                }
            }
        }
        
        try {
            filterChain.doFilter(request, response);
        } finally {
            // Do NOT clear here if it's needed by the controller, 
            // but we should clear after the request is finished.
            // JwtAuthFilter also clears in a finally block.
        }
    }
}