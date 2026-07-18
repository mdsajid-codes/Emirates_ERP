package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.dto.AtsClientFilterRequest;
import com.example.multi_tanent.ats.entity.AtsClient;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class AtsClientSpecification {

    public static Specification<AtsClient> buildSpec(AtsClientFilterRequest filter, Long tenantId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tenant scoping
            predicates.add(cb.equal(root.get("tenant").get("id"), tenantId));

            if (filter.getSearch() != null && !filter.getSearch().trim().isEmpty()) {
                String likePattern = "%" + filter.getSearch().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("clientName")), likePattern),
                        cb.like(cb.lower(root.get("emailId")), likePattern),
                        cb.like(cb.lower(root.get("city")), likePattern),
                        cb.like(cb.lower(root.get("website")), likePattern)
                ));
            }

            if (filter.getStatus() != null && !filter.getStatus().trim().isEmpty()) {
                predicates.add(cb.equal(root.get("status"), filter.getStatus()));
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

            if (filter.getPrimaryOwnerId() != null) {
                predicates.add(cb.equal(root.get("primaryOwner").get("id"), filter.getPrimaryOwnerId()));
            }

            if (filter.getClientLeadId() != null) {
                predicates.add(cb.equal(root.get("clientLead").get("id"), filter.getClientLeadId()));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
