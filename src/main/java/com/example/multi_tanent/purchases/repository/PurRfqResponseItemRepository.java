package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurRfqResponseItem;

import java.util.List;

public interface PurRfqResponseItemRepository extends JpaRepository<PurRfqResponseItem, Long> {
    List<PurRfqResponseItem> findByResponseId(Long responseId);
}
 