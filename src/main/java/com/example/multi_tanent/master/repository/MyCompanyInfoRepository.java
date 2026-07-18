package com.example.multi_tanent.master.repository;

import com.example.multi_tanent.master.entity.MyCompanyInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MyCompanyInfoRepository extends JpaRepository<MyCompanyInfo, Long> {
}
