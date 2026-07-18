package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurRfqResponseAnswer;

import java.util.List;

public interface PurRfqResponseAnswerRepository extends JpaRepository<PurRfqResponseAnswer, Long> {
    List<PurRfqResponseAnswer> findByResponseId(Long responseId);
}
