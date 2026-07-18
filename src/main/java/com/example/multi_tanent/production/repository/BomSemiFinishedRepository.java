package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.BomSemiFinished;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BomSemiFinishedRepository extends JpaRepository<BomSemiFinished, Long> {
}
