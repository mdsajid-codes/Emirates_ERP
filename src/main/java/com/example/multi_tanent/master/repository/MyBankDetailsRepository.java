package com.example.multi_tanent.master.repository;

import com.example.multi_tanent.master.entity.MyBankDetails;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MyBankDetailsRepository extends JpaRepository<MyBankDetails, Long> {
}
