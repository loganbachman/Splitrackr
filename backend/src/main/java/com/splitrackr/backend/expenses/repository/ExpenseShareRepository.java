package com.splitrackr.backend.expenses.repository;

import com.splitrackr.backend.expenses.model.Expense;
import com.splitrackr.backend.expenses.model.ExpenseShare;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface ExpenseShareRepository extends JpaRepository<ExpenseShare, Integer> {
    List<ExpenseShare> findByExpense(Expense expense);

    @Modifying
    @Transactional
    void deleteByExpense(Expense expense);
}
