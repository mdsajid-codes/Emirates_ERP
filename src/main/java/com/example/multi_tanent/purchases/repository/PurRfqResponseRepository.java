package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurRfqResponse;

import java.util.Optional;
import java.util.List;

public interface PurRfqResponseRepository extends JpaRepository<PurRfqResponse, Long> {
    Optional<PurRfqResponse> findByResponseNumber(String responseNumber);
    Optional<PurRfqResponse> findByRfqId(Long rfqId);
}
