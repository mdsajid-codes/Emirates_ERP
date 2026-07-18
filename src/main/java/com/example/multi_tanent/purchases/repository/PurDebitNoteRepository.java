package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.purchases.entity.PurDebitNote;

@Repository
public interface PurDebitNoteRepository extends JpaRepository<PurDebitNote, Long> {
}
