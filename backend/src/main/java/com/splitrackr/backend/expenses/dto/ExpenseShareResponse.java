package com.splitrackr.backend.expenses.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpenseShareResponse {
    private Integer shareId;
    private Integer userId;
    private Integer amountCents;
}
