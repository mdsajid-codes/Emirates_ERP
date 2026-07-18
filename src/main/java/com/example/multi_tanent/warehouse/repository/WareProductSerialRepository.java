package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.WareProductSerial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WareProductSerialRepository extends JpaRepository<WareProductSerial, Long> {
    Optional<WareProductSerial> findBySerialNumber(String serialNumber);

    boolean existsBySerialNumber(String serialNumber);
}
