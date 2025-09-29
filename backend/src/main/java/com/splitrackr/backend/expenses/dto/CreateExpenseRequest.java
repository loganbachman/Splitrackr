package com.splitrackr.backend.expenses.dto;

import com.splitrackr.backend.expenses.model.SplitType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateExpenseRequest {

    private String description;
    private Integer amountCents;
    private SplitType type;
    private List<ExpenseShareRequest> share;
}
