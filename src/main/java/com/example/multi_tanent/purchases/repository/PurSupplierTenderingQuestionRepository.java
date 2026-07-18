package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurSupplierTenderingQuestion;

import java.util.List;

public interface PurSupplierTenderingQuestionRepository extends JpaRepository<PurSupplierTenderingQuestion, Long> {
    List<PurSupplierTenderingQuestion> findByTenderingId(Long tenderingId);
}
