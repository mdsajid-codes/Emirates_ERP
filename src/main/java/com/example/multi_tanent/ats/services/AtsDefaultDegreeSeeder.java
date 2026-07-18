package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.entity.AtsDegree;
import com.example.multi_tanent.ats.repository.AtsDegreeRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AtsDefaultDegreeSeeder {

    private final AtsDegreeRepository degreeRepository;
    private final TenantRepository tenantRepository;

    private static final List<String> DEFAULT_DEGREES = Arrays.asList(
            "Bachelor of Science (B.Sc)",
            "Bachelor of Arts (B.A)",
            "Bachelor of Commerce (B.Com)",
            "Bachelor of Technology (B.Tech / B.E)",
            "Bachelor of Computer Applications (BCA)",
            "Master of Science (M.Sc)",
            "Master of Arts (M.A)",
            "Master of Commerce (M.Com)",
            "Master of Technology (M.Tech / M.E)",
            "Master of Computer Applications (MCA)",
            "Master of Business Administration (MBA)",
            "Doctor of Philosophy (PhD)",
            "Doctor of Medicine (MD)",
            "Bachelor of Medicine, Bachelor of Surgery (MBBS)",
            "Bachelor of Laws (LLB)",
            "Master of Laws (LLM)",
            "Diploma",
            "Post Graduate Diploma",
            "Associate Degree",
            "High School / 10th Pass",
            "Intermediate / 12th Pass"
    );

    @Transactional("tenantTx")
    public void seedForCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            return;
        }

        Tenant tenant = tenantRepository.findByTenantId(tenantId).orElse(null);
        if (tenant == null) {
            log.warn("Tenant not found for tenantId: {}, skipping degree seeding", tenantId);
            return;
        }

        log.info("Seeding missing default degrees for tenant: {}", tenantId);
        int seededCount = 0;
        for (String degreeName : DEFAULT_DEGREES) {
            if (!degreeRepository.existsByNameAndTenantId(degreeName, tenant.getId())) {
                AtsDegree degree = AtsDegree.builder()
                        .tenant(tenant)
                        .name(degreeName)
                        .build();
                degreeRepository.save(degree);
                seededCount++;
            }
        }
        log.info("Successfully seeded {} new default degrees for tenant: {}", seededCount, tenantId);
    }
}
