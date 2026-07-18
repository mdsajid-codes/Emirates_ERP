package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.enitity.BaseBankDetails;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BaseBankDetailsRepository extends JpaRepository<BaseBankDetails, Long> {
    List<BaseBankDetails> findByPartyId(Long partyId);
}