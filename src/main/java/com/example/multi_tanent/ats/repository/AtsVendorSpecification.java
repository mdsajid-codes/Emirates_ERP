package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.dto.AtsVendorFilterRequest;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class AtsVendorSpecification {

    public static Specification<AtsVendor> buildSpec(AtsVendorFilterRequest filter, Long tenantId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tenant scoping
            predicates.add(cb.equal(root.get("tenant").get("id"), tenantId));

            if (filter.getSearch() != null && !filter.getSearch().trim().isEmpty()) {
                String likePattern = "%" + filter.getSearch().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("companyName")), likePattern),
                        cb.like(cb.lower(root.get("primaryEmail")), likePattern),
                        cb.like(cb.lower(root.get("vendorCode")), likePattern)
                ));
            }

            if (filter.getVendorStatus() != null) {
                predicates.add(cb.equal(root.get("vendorStatus"), filter.getVendorStatus()));
            }

            if (filter.getVendorType() != null) {
                predicates.add(cb.equal(root.get("vendorType"), filter.getVendorType()));
            }

            if (filter.getIsBlacklisted() != null) {
                predicates.add(cb.equal(root.get("isBlacklisted"), filter.getIsBlacklisted()));
            }

            if (filter.getCountryId() != null) {
                predicates.add(cb.equal(root.get("country").get("id"), filter.getCountryId()));
            }

            if (filter.getStateId() != null) {
                predicates.add(cb.equal(root.get("state").get("id"), filter.getStateId()));
            }

            if (filter.getPrimaryBusinessUnitId() != null) {
                predicates.add(cb.equal(root.get("primaryBusinessUnit").get("id"), filter.getPrimaryBusinessUnitId()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
