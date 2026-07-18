package com.example.multi_tanent.spersusers.dto;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import lombok.Data;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@Data
public class TenantDto {
    private Long id;
    private String name;
    private String logoImgUrl;
    private String contactEmail;
    private String contactPhone;
    private String address;
    private String smtpHost;
    private Integer smtpPort;
    private String smtpUsername;
    // smtpPassword is not exposed in DTO for security reasons
    private String companyEmail;

    public static TenantDto fromEntity(Tenant tenant) {
        if (tenant == null) {
            return null;
        }
        TenantDto dto = new TenantDto();
        dto.setId(tenant.getId());
        dto.setName(tenant.getName());
        dto.setContactEmail(tenant.getContactEmail());
        dto.setContactPhone(tenant.getContactPhone());
        dto.setAddress(tenant.getAddress());

        dto.setSmtpHost(tenant.getSmtpHost());
        dto.setSmtpPort(tenant.getSmtpPort());
        dto.setSmtpUsername(tenant.getSmtpUsername());
        dto.setCompanyEmail(tenant.getCompanyEmail());


        if (tenant.getLogoImgUrl() != null && !tenant.getLogoImgUrl().isBlank()) {
            String fullUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/pos/uploads/view/")
                    .path(tenant.getLogoImgUrl())
                    .build().toUriString();
            dto.setLogoImgUrl(fullUrl);
        }
        return dto;
    }
}