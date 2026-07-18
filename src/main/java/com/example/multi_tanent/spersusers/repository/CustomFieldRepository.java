package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.enitity.CustomField;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CustomFieldRepository extends JpaRepository<CustomField, Long> {
    List<CustomField> findByPartyId(Long partyId);
}