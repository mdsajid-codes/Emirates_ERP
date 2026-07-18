package com.example.multi_tanent.materials.repository;

import com.example.multi_tanent.materials.entity.MaterialRequision;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class MaterialRequisionSpecification {

    public static Specification<MaterialRequision> getSpecifications(Long tenantId, String search, LocalDate fromDate,
            LocalDate toDate) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Tenant filter
            predicates.add(criteriaBuilder.equal(root.get("tenant").get("id"), tenantId));

            // Date Range
            if (fromDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("requestDate"), fromDate));
            }
            if (toDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("requestDate"), toDate));
            }

            // Search (Request No, MO Number, Employee Name)
            if (StringUtils.hasText(search)) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate requestNo = criteriaBuilder.like(criteriaBuilder.lower(root.get("requestNo")), searchPattern);
                Predicate moNumber = criteriaBuilder
                        .like(criteriaBuilder.lower(root.get("manufacturingOrder").get("moNumber")), searchPattern);
                // Need to handle joins for nested search if needed, but keeping it simple for
                // now
                // Employee name join might be needed

                predicates.add(criteriaBuilder.or(requestNo, moNumber));
            }

            query.orderBy(criteriaBuilder.desc(root.get("createdAt")));
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
