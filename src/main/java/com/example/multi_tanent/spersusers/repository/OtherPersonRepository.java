package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.enitity.OtherPerson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OtherPersonRepository extends JpaRepository<OtherPerson, Long> {
    List<OtherPerson> findByPartyId(Long partyId);
}