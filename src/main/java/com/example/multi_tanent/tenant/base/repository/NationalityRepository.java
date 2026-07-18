package com.example.multi_tanent.tenant.base.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.tenant.base.entity.Nationality;

public interface NationalityRepository extends JpaRepository<Nationality, Long> {
    Optional<Nationality> findByName(String name);
    Optional<Nationality> findByIsoCode(String isoCode);
}
