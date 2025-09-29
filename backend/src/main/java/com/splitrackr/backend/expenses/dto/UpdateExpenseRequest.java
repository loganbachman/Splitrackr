package com.splitrackr.backend.expenses.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateExpenseRequest {
    private String description;
    private Integer amountCents;
}
