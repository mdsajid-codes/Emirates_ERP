package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.dto.LeadFilterRequest;
import com.example.multi_tanent.crm.entity.CrmLead;
import com.example.multi_tanent.crm.enums.CrmLeadStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

public class CrmLeadSpecification {

    public static Specification<CrmLead> build(Long tenantId, LeadFilterRequest filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Tenant Filter (Crucial for multi-tenancy)
            if (tenantId != null) {
                predicates.add(cb.equal(root.get("tenant").get("id"), tenantId));
            }

            // 2. Search Logic (q)
            if (StringUtils.hasText(filter.getQ())) {
                String pattern = "%" + filter.getQ().toLowerCase() + "%";
                
                // Explicit joins are safer for count queries in Hibernate 6+
                var companyJoin = root.join("company", jakarta.persistence.criteria.JoinType.LEFT);
                
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("firstName")), pattern),
                        cb.like(cb.lower(root.get("lastName")), pattern),
                        cb.like(cb.lower(root.get("email")), pattern),
                        cb.like(cb.lower(root.get("phone")), pattern),
                        cb.like(cb.lower(root.get("leadNo")), pattern),
                        cb.like(cb.lower(companyJoin.get("name")), pattern)
                ));
            }

            // 3. Status Filter
            if (StringUtils.hasText(filter.getStatus()) && !"ALL".equalsIgnoreCase(filter.getStatus())) {
                try {
                    // Try to match the enum (usually uppercase in backend)
                    CrmLeadStatus statusEnum = CrmLeadStatus.valueOf(filter.getStatus().toUpperCase());
                    predicates.add(cb.equal(root.get("status"), statusEnum));
                } catch (Exception e) {
                    // Log or handle invalid status string
                }
            }

            // 4. Owner Filter
            if (filter.getOwnerId() != null && filter.getOwnerId() > 0) {
                predicates.add(cb.equal(root.get("owner").get("id"), filter.getOwnerId()));
            }

            // 5. Period (Date Range)
            if (StringUtils.hasText(filter.getPeriod()) && !"ALL".equalsIgnoreCase(filter.getPeriod())) {
                try {
                    OffsetDateTime now = OffsetDateTime.now();
                    OffsetDateTime start = null;

                    switch (filter.getPeriod().toUpperCase()) {
                        case "TODAY":
                            start = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
                            break;
                        case "WEEK":
                            start = now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
                            break;
                        case "MONTH":
                            start = now.with(TemporalAdjusters.firstDayOfMonth())
                                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
                            break;
                        case "YEAR":
                            start = now.with(TemporalAdjusters.firstDayOfYear())
                                    .withHour(0).withMinute(0).withSecond(0).withNano(0);
                            break;
                    }

                    if (start != null) {
                        predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
                    }
                } catch (Exception e) {
                    // Date math safety
                }
            }

            if (predicates.isEmpty()) {
                return cb.conjunction();
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
