package com.example.multi_tanent.accounts.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.accounts.entity.ExpenseItem;

public interface ExpenseItemRepository extends JpaRepository<ExpenseItem, Long> {
}
