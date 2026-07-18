package com.example.multi_tanent.master.repository;

import com.example.multi_tanent.master.entity.MasterUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface MasterUserRepository extends JpaRepository<MasterUser, Long> {
  Optional<MasterUser> findByUsername(String username);
}