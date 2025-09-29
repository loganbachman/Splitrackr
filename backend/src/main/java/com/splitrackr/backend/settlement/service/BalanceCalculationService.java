package com.splitrackr.backend.settlement.service;

import com.splitrackr.backend.expenses.model.Expense;
import com.splitrackr.backend.expenses.model.ExpenseStatus;
import com.splitrackr.backend.expenses.repository.ExpenseRepository;
import com.splitrackr.backend.expenses.repository.ExpenseShareRepository;
import com.splitrackr.backend.settlement.model.Settlement;
import com.splitrackr.backend.settlement.repository.SettlementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BalanceCalculationService {

    private final ExpenseRepository expenseRepository;
    private final SettlementRepository settlementRepository;
    private final ExpenseShareRepository expenseShareRepository;


    public Map<Integer, Integer> calculateBalances(Integer householdId) {
        var period = determinePeriod(householdId);
        return calculateBalancesInPeriod(householdId, period.start, period.end);
    }

    // determine start and end of the current settlement
    public PeriodBoundary determinePeriod(Integer householdId) {
        var lastFinalized = settlementRepository.findLatestFinalizedByHousehold(householdId);
        Instant start = lastFinalized.map(Settlement::getPeriodEnd).orElse(null);
        Instant end = Instant.now();

        return new PeriodBoundary(start, end);
    }

    private Map<Integer, Integer> calculateBalancesInPeriod(Integer householdId, Instant start, Instant end) {
        Map<Integer, Integer> balances = new HashMap<>();

        List<Expense> expenses;

        if(start == null) {
            // if first settlement, just get all expenses
            expenses = expenseRepository.findByHousehold_HouseholdIdAndStatusOrderByDateCreatedDesc(
                    householdId, ExpenseStatus.ACTIVE);
        } else {
            // if not first settlement, get everything after most recent
            expenses = expenseRepository.findByHousehold_HouseholdIdAndStatusAndDateCreatedAfterOrderByDateCreatedDesc(
                    householdId, ExpenseStatus.ACTIVE, start
            );
        }

        // calculates balances (before minimal transfer)
        for(var expense : expenses) {
            Integer payerId = expense.getPayer().getId();
            Integer amountCents = expense.getAmountCents();

            // add to payer balance amountCents for individual expense
            balances.put(payerId,
                    balances.getOrDefault(payerId, 0) + amountCents);

            // subtract from balance for each expense share
            var shares = expenseShareRepository.findByExpense(expense);
            for(var share : shares) {
                Integer userId = share.getUser().getId();
                Integer shareAmount = share.getAmountCents();
                balances.put(userId, balances.getOrDefault(userId, 0) - shareAmount);
            }
        }
        return balances;
    }

    public record PeriodBoundary(Instant start, Instant end) {}


}
