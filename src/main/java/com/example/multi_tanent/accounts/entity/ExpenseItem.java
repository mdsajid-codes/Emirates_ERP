package com.example.multi_tanent.accounts.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "expense_items")
public class ExpenseItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "expense_item_id")
    private Long expenseItemId;

    @Column(length = 200)
    private String description;

    public Long getExpenseItemId() { return expenseItemId; }
    public void setExpenseItemId(Long expenseItemId) { this.expenseItemId = expenseItemId; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
