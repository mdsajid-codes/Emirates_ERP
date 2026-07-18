package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProManageTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProManageTaskRepository extends JpaRepository<ProManageTask, Long> {
    // Custom query methods can be added here
}