package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.enitity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    Optional<Location> findByName(String name);
    // Custom query methods can be added here if needed
}