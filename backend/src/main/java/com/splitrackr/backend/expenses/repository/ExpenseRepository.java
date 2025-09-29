package com.splitrackr.backend.expenses.repository;

import com.splitrackr.backend.expenses.model.Expense;
import com.splitrackr.backend.expenses.model.ExpenseStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    List<Expense> findByHousehold_HouseholdIdAndStatusOrderByDateCreatedDesc(
            Integer householdId, ExpenseStatus status
    );

    List<Expense> findByPayer_IdAndStatusOrderByDateCreatedDesc(
            Integer userId, ExpenseStatus status
    );

    List<Expense> findByHousehold_HouseholdIdAndStatusAndDateCreatedAfterOrderByDateCreatedDesc(
            Integer householdId, ExpenseStatus status, Instant dateCreated
    );
}
