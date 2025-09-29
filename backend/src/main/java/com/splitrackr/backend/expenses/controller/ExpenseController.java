package com.splitrackr.backend.expenses.controller;

import com.splitrackr.backend.expenses.dto.CreateExpenseRequest;
import com.splitrackr.backend.expenses.dto.ExpenseResponse;
import com.splitrackr.backend.expenses.dto.UpdateExpenseRequest;
import com.splitrackr.backend.expenses.model.Expense;
import com.splitrackr.backend.expenses.model.ExpenseStatus;
import com.splitrackr.backend.expenses.service.ExpenseService;
import lombok.AllArgsConstructor;
import org.apache.coyote.Response;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.context.request.NativeWebRequest;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/expense")
@AllArgsConstructor
public class ExpenseController {

    private final ExpenseService service;

    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @RequestBody CreateExpenseRequest request
    ) {
        return ResponseEntity.ok(service.createExpense(request));
    }

    @GetMapping("/list")
    public ResponseEntity<List<ExpenseResponse>> getExpenses() {
        return ResponseEntity.ok(service.listExpenses());
    }

    @GetMapping("/return")
    public ResponseEntity<ExpenseResponse> getExpenseById(
            @RequestParam Integer expenseId
    ) {
        return ResponseEntity.ok(service.getExpense(expenseId));
    }

    @GetMapping("/returnUser")
    public ResponseEntity<List<ExpenseResponse>> getUserExpensesById() {
        return ResponseEntity.ok(service.getUserExpenses());
    }

    @PutMapping("/update")
    public ResponseEntity<ExpenseResponse> updateExpense(
            @RequestParam Integer expenseId,
            @RequestBody UpdateExpenseRequest request
    ) {
        return ResponseEntity.ok(service.updateExpense(expenseId, request));
    }

    @DeleteMapping("/delete")
    public ResponseEntity<Map<String, String>> deleteExpense(
            @RequestParam Integer expenseId
    ) {
        service.deleteExpense(expenseId);
        return ResponseEntity.ok(Map.of("message", "Expense has been deleted"));
    }
}
